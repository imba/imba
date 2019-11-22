var fs = require('fs');
// if(false){
// 	var compiler = require('../vendor/imbac-1.5.0.js')
// var grammar = fs.writeFileSync(
// 	__dirname + '/../lib/grammar3.js',
// 	compiler.compile(
// 		fs.readFileSync(__dirname + '/../src/compiler/grammar.imba1','utf8'),{}
// 	).js,'utf8'
// )
// } else {
var parser = require('../lib/grammar.js').parser
fs.writeFileSync(__dirname + "/../lib/parser.js", parser.generate());

