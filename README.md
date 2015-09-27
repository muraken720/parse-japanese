# parse-japanese [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

A Japanese language parser producing [NLCST](https://github.com/wooorm/nlcst)
nodes.

*   For semantics of nodes, see [NLCST](https://github.com/wooorm/nlcst);

## Installation

[npm](https://docs.npmjs.com/cli/install):

```bash
npm install parse-japanese
```

## Usage

```javascript
var inspect = require('unist-util-inspect')

var ParseJapanese = require('parse-japanese')
var japanese = new ParseJapanese()

var text = '1 これは前段です。これは中段（２文の場合は後段。）です。これは後段です。\n'

japanese.parse(text, (cst) => {
  console.log(inspect(cst))
})
/**
* RootNode[1]
* └─ ParagraphNode[4]
*    ├─ SentenceNode[3]
*    │  ├─ WordNode[1]
*    │  │  └─ TextNode: '1'
*    │  ├─ WhiteSpaceNode: ' '
*    │  └─ WordNode[5]
*    │     ├─ TextNode: 'これ'
*    │     ├─ TextNode: 'は'
*    │     ├─ TextNode: '前段'
*    │     ├─ TextNode: 'です'
*    │     └─ PunctuationNode: '。'
*    ├─ SentenceNode[1]
*    │  └─ WordNode[14]
*    │     ├─ TextNode: 'これ'
*    │     ├─ TextNode: 'は'
*    │     ├─ TextNode: '中段'
*    │     ├─ PunctuationNode: '（'
*    │     ├─ TextNode: '２'
*    │     ├─ TextNode: '文'
*    │     ├─ TextNode: 'の'
*    │     ├─ TextNode: '場合'
*    │     ├─ TextNode: 'は'
*    │     ├─ TextNode: '後段'
*    │     ├─ PunctuationNode: '。'
*    │     ├─ PunctuationNode: '）'
*    │     ├─ TextNode: 'です'
*    │     └─ PunctuationNode: '。'
*    ├─ SentenceNode[1]
*    │  └─ WordNode[5]
*    │     ├─ TextNode: 'これ'
*    │     ├─ TextNode: 'は'
*    │     ├─ TextNode: '後段'
*    │     ├─ TextNode: 'です'
*    │     └─ PunctuationNode: '。'
*    └─ WhiteSpaceNode: '
* '
*/


japanese = new ParseJapanese({pos: true})
text = 'すもももももももものうち。'

japanese.parse(text, (cst) => {
  console.log(inspect(cst))
})

/**
* RootNode[1]
* └─ ParagraphNode[2]
*    ├─ SentenceNode[1]
*    │  └─ WordNode[8]
*    │     ├─ TextNode: 'すもも' [data={"word_id":404420,"word_type":"KNOWN","word_position":1,"surface_form":"すもも","pos":"名詞","pos_detail_1":"一般","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"すもも","reading":"スモモ","pronunciation":"スモモ"}]
*    │     ├─ TextNode: 'も' [data={"word_id":2595480,"word_type":"KNOWN","word_position":4,"surface_form":"も","pos":"助詞","pos_detail_1":"係助詞","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"も","reading":"モ","pronunciation":"モ"}]
*    │     ├─ TextNode: 'もも' [data={"word_id":604730,"word_type":"KNOWN","word_position":5,"surface_form":"もも","pos":"名詞","pos_detail_1":"一般","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"もも","reading":"モモ","pronunciation":"モモ"}]
*    │     ├─ TextNode: 'も' [data={"word_id":2595480,"word_type":"KNOWN","word_position":7,"surface_form":"も","pos":"助詞","pos_detail_1":"係助詞","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"も","reading":"モ","pronunciation":"モ"}]
*    │     ├─ TextNode: 'もも' [data={"word_id":604730,"word_type":"KNOWN","word_position":8,"surface_form":"もも","pos":"名詞","pos_detail_1":"一般","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"もも","reading":"モモ","pronunciation":"モモ"}]
*    │     ├─ TextNode: 'の' [data={"word_id":2595360,"word_type":"KNOWN","word_position":10,"surface_form":"の","pos":"助詞","pos_detail_1":"連体化","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"の","reading":"ノ","pronunciation":"ノ"}]
*    │     ├─ TextNode: 'うち' [data={"word_id":1467000,"word_type":"KNOWN","word_position":11,"surface_form":"うち","pos":"名詞","pos_detail_1":"非自立","pos_detail_2":"副詞可能","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"うち","reading":"ウチ","pronunciation":"ウチ"}]
*    │     └─ PunctuationNode: '。' [data={"word_id":2612880,"word_type":"KNOWN","word_position":13,"surface_form":"。","pos":"記号","pos_detail_1":"句点","pos_detail_2":"*","pos_detail_3":"*","conjugated_type":"*","conjugated_form":"*","basic_form":"。","reading":"。","pronunciation":"。"}]
*    └─ WhiteSpaceNode: '
* ' [data={"surface_form":"\n","pos":"記号","pos_detail_1":"空白"}]
*/
```

## API

*   [ParseJapanese(options?)](#parsejapaneseoptions)
*   [ParseJapanese#parse(value)](#parsejapaneseparsevaluecb)

### ParseJapanese(options?)

Exposes the functionality needed to tokenize natural Japanese languages into a syntax tree.

Parameters:

*   `options` (`Object`, optional)

    *   `position` (`boolean`, default: `true`) - Whether to add positional information to nodes.
    *   `pos` (`boolean`, default: `false`) - Whether to add part-of-speech information(by using [kuromoji.js](https://github.com/takuyaa/kuromoji.js)) to nodes.
    *   `dicDir` (`string`, default: `../node_modules/kuromoji/dist/dict/`) - Whether to set Dictionaries directory for kuromoji.js.
                

### ParseJapanese#parse(value, cb)

Tokenize natural Japanese languages into an [NLCST](https://github.com/wooorm/nlcst).

Parameters:
	
*   `value` ([`VFile`](https://github.com/wooorm/vfile) or `string`)
    — Text document;

*   `cb` ([`Function`](#function-donecst)).
    — Callback function;
 
#### function done(cst)

Callback invoked when the output is generated with the processed document.

Parameters:

*   `cst` (`string`) — Generated document;

## Related

*   [parse-latin](https://github.com/wooorm/parse-latin)
*   [nlcst](https://github.com/wooorm/nlcst)
*   [retext](https://github.com/wooorm/retext)

## License

[MIT](LICENSE)
