'use strict'

var ParseJapanese = require('../')

var inspect = require('unist-util-inspect')

var options = {
  position: true,
  pos: false,
  dicDir: '../node_modules/kuromoji/dist/dict/'
}

var japanese = new ParseJapanese(options)
// var japanese = new ParseJapanese()

var text = 'タイトル\n' +
    '\n' +
    '第1条 これは（１文、２文。）となります。' +
    '２つ目の後段。' +
    '３つ目の後段（This is a pen. F。）と（「それはAです。」と発言した。H。）と（I。J。）になります。' +
    'これは最後の後段です。\n' +
    '（見出し）\n' +
    'さらに文です。\n'

japanese.parse(text, (cst) => {
  console.log(JSON.stringify(cst, null, ' '))
  console.log(inspect(cst))
})

// var toVFile = require('to-vfile')//
// var file = toVFile.readSync('../joubun.txt')
// let text = file.contents
// let text = 'タイトル\n';
