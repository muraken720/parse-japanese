'use strict'

var assert = require('assert')
var ParseJapanese = require('../')
var path = require('path')

var select = require('unist-util-select')

describe('ParseJapaneseTest', () => {
  it('normal', (done) => {
    var options = {
      position: false,
      pos: false,
      dicDir: path.join(path.dirname(require.resolve('kuromoji')), '..', 'dict')
    }

    var japanese = new ParseJapanese(options)

    var text = 'タイトル\n' +
        '\n' +
        '1 これは前段です。' +
        'これは中段（２文の場合は後段。）です。' +
        'これは後段です。\n' +
        '（見出し）\n' +
        'さらに文です。\n'

    japanese.parse(text, (cst) => {
      // ParagraphNodeは5つ
      assert(cst.children.length === 5)

      // 3段落目のSentenceNodeは3つ
      var sentences = select(cst.children[2], 'SentenceNode')
      assert(sentences.length === 3)

      // 3段落目の１文目はWordNodeが2つ
      var words = select(cst.children[2].children[0], 'WordNode')
      assert(words.length === 2)

      done()
    })
  })
})
