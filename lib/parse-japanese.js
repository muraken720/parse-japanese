/**
 * @author Kenichiro Murata
 * @copyright 2015 Kenichiro Murata
 * @license MIT
 * @fileoverview Japanese (natural language) parser.
 */

'use strict'

/**
 * Dependencies.
 */

var kuromoji = require('kuromoji')
var Jaco = require('jaco').Jaco
var VFile = require('vfile')

/**
 * Constants.
 */

var LINEBREAKE_MARK = /\r?\n/g
var M_OP = '括弧開'
var M_CP = '括弧閉'
var M_P = '句点'
var WS = '空白'

/**
 * サロゲートペアに対応した配列化
 * @param str
 * @returns {Array|{index: number, input: string}|*|Array}
 */
function stringToArray (str) {
  return str.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[^\uD800-\uDFFF]/g) || []
}

/**
 * Tokenize
 * @param parser
 * @param text
 * @param cb
 * @returns {{type: string, children: Array}}
 */
function tokenize (parser, text, cb) {
  var linedepth = 0
  var offset = 0
  var line, column

  var textLines = text.split(LINEBREAKE_MARK)

  var rootNode = createParentNode('Root')

  /**
   * Return current position
   * @returns {{line: *, column: *, offset: number}}
   */
  function now () {
    return {
      'line': line,
      'column': column,
      'offset': offset
    }
  }

  /**
   * Return next position
   * @param value
   * @returns {{line, column, offset}|{line: *, column: *, offset: number}}
   */
  function next (value) {
    var length = stringToArray(value).length
    offset += length
    column += length
    return now()
  }

  /**
   * Create position
   * @param value
   * @returns {{start: ({line, column, offset}|{line: *, column: *, offset: number}), end: ({line, column, offset}|{line: *, column: *, offset: number})}}
   */
  function createPosition (value) {
    return {
      start: now(),
      end: next(value)
    }
  }

  /**
   * Create ParentNode for RootNode, SentenceNode and WordNode.
   * @param type
   * @returns {{type: string, children: Array}}
   */
  function createParentNode (type) {
    var node = {
      type: type + 'Node',
      children: []
    }
    if (parser.position) {
      node.position = {}
    }
    return node
  }

  /**
   * Create TextNode for SymbolNode, PunctuationNode, WhiteSpaceNode, SourceNode, and TextNode.
   * @param type
   * @param item
   * @returns {{type: string, value: *}}
   */
  function createTextNode (type, item) {
    var node = {
      type: type + 'Node',
      value: item.surface_form
    }
    if (parser.position) {
      node.position = createPosition(item.surface_form)
    }
    if (parser.pos) {
      node.data = item
    }
    return node
  }

  /**
   * Add Node to ParentNode
   * @param node
   * @param parent
   */
  function add (node, parent) {
    parent.children.push(node)
    if (parser.position) {
      parent.position = {
        start: parent.children[0].position.start,
        end: node.position.end
      }
    }
  }

  /**
   * Callback Function
   * @param element
   * @param index
   * @param array
   */
  function tokenizeByLine (element, index, array) {
    line = index + 1
    column = 1

    var paragraphNode = createParentNode('Paragraph')
    var sentenceNode = createParentNode('Sentence')
    var wordNode = createParentNode('Word')

    // 空行の場合
    if (element === '') {
      // 文章の最後の改行による空行でなければ改行ノードを追加する
      if (index !== array.length - 1) {
        // 改行ノードをParagraphNodeに追加する
        add(createTextNode('WhiteSpace', {surface_form: '\n', pos: '記号', pos_detail_1: '空白'}), paragraphNode)
        // ParagraphNodeをRoodNodeに追加
        add(paragraphNode, rootNode)
      }
      return
    }

    // 半角括弧を全角括弧に変換
    var str = new Jaco(element).toWideJapneseSymbol().toString()
    // kuromoji.jsにより形態素解析を行う
    var data = parser.tokenizer.tokenize(str)

    // 分解された文字列単位にNLCST Treeを生成する
    for (var tindex = 0; tindex < data.length; tindex++) {
      var item = data[tindex]

      // 行頭の場合
      if (tindex === 0) {
        // SentenceNodeをParagraphNodeに追加
        add(sentenceNode, paragraphNode)
      }

      // 文字が空白の場合
      if (item.pos_detail_1 === WS) {
        // インラインの場合
        if (linedepth) {
          add(createTextNode('WhiteSpace', item), wordNode)
        } else {
          // アウトラインの場合
          // WordNodeに子ノードが存在する場合、WordNodeを終了する
          if (wordNode.children.length) {
            add(wordNode, sentenceNode)
            wordNode = createParentNode('Word')
          }
          add(createTextNode('WhiteSpace', item), sentenceNode)
        }
      } else if (item.pos_detail_1 === M_OP) {
        // 文字が開括弧の場合
        linedepth++
        add(createTextNode('Punctuation', item), wordNode)
      } else if (item.pos_detail_1 === M_CP) {
        // 文字が閉括弧の場合
        linedepth--
        add(createTextNode('Punctuation', item), wordNode)
      } else if (item.pos_detail_1 === M_P) {
        // 文字が句点の場合
        add(createTextNode('Punctuation', item), wordNode)
        // アウトラインの場合、WordNodeを終了し、次のWordNodeを作る
        if (!linedepth) {
          add(wordNode, sentenceNode)
          wordNode = createParentNode('Word')

          // 行末でなければ次のSentenceNodeを作る
          if (tindex !== data.length - 1) {
            sentenceNode = createParentNode('Sentence')
            add(sentenceNode, paragraphNode)
          }
        }
      } else {
        // その他の文字の場合
        add(createTextNode('Text', item), wordNode)
      }

      // 行末の場合
      if (tindex === data.length - 1) {
        // WordNodeに子ノードが存在する場合、WordNodeを終了する（句点で終わらない文章の場合）
        if (wordNode.children.length) {
          add(wordNode, sentenceNode)
        }
        // 改行ノードをParagraphNodeに追加する
        add(createTextNode('WhiteSpace', {surface_form: '\n', pos: '記号', pos_detail_1: '空白'}), paragraphNode)
        // ParagraphNodeをRoodNodeに追加
        add(paragraphNode, rootNode)
      }
    }
  }

  kuromoji
      .builder({dicPath: parser.dicDir})
      .build(function (error, tokenizer) {
        if (error) {
          console.log(error)
        } else {
          parser.tokenizer = tokenizer
          textLines.forEach(tokenizeByLine)
          cb(rootNode)
        }
      })
}

/**
 * Transform Japanese natural language into
 * an NLCST-tree.
 *
 * @param {VFile?} file - Virtual file.
 * @param {Object?} options - Configuration.
 * @constructor {ParseJapanese}
 */
function ParseJapanese (file, options) {
  var position, pos, dicDir

  if (!(this instanceof ParseJapanese)) {
    return new ParseJapanese(file, options)
  }

  if (file && file instanceof VFile) {
    this.file = file
  } else {
    options = file
  }

  position = options && options.position

  if (position !== null && position !== undefined) {
    this.position = Boolean(position)
  }

  pos = options && options.pos

  if (pos !== null && pos !== undefined) {
    this.pos = Boolean(pos)
  }

  dicDir = options && options.dicDir

  if (dicDir !== null && dicDir !== undefined) {
    this.dicDir = dicDir
  }
}

/**
 * Quick access to the prototype.
 */

var parseJapanesePrototype = ParseJapanese.prototype

/**
 * Default position.
 */
parseJapanesePrototype.position = true

/**
 * Default pos.
 */
parseJapanesePrototype.pos = false

/**
 * Default dicDir.
 */
parseJapanesePrototype.dicDir = 'node_modules/parse-japanese/node_modules/kuromoji/dist/dict/'

/**
 * Easy access to the document parser.
 * @param value
 * @param cb
 */
parseJapanesePrototype.parse = function (value, cb) {
  tokenize(this, this.file ? this.file.toString() : value, cb)
}

/**
 * Expose.
 */

module.exports = ParseJapanese
