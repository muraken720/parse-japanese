'use strict'

var assert = require('power-assert')

var ParseJapanese = require('../')

var select = require('unist-util-select');

describe("ParseJapaneseTest", () => {
  it("normal", (done) => {

    var options = {
      position: false,
      pos: false,
      dicDir: 'node_modules/kuromoji/dist/dict/'
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
