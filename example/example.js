'use strict'

var ParseJapanese = require('../')
var inspect = require('unist-util-inspect')

var options = {
  position: true,
  pos: false
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
  console.log(JSON.stringify(cst, null, ' '))
  console.log(inspect(cst))
})
