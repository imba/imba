(function(){
require('./helpers');
require('./base');
require('./statements');
require('./params');
require('./code');
require('./literal');
require('./identifier');

require('./op');
require('./access');
require('./assign');
require('./call');
require('./flow');
require('./range');
require('./splat');
require('./tag');
require('./selector');
require('./vars');
require('./defer');
require('./utils');
require('./scope');
AST.SELF = new AST.Self();
AST.SUPER = new AST.Super();
AST.TRUE = new AST.True('true');
AST.FALSE = new AST.False('false');
AST.ARGUMENTS = new AST.ArgsReference('arguments');
AST.EMPTY = '';
AST.NULL = 'null';

AST.RESERVED = ['default', 'native', 'enum', 'with'];
AST.RESERVED_REGEX = /^(default|native|enum|with)$/;

AST.UNION = new AST.Const('union$');
AST.INTERSECT = new AST.Const('intersect$');
AST.CLASSDEF = new AST.Const('imba$class');
AST.TAGDEF = new AST.Const('Imba.Tag.define');
AST.NEWTAG = new AST.Identifier("tag$");
AST.Imba = require('../compiler');
}())