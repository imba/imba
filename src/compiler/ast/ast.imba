

# Need to organize these nodes better. Right now it's almost arbitrary where they are
# would be better with a single file per node even
require './helpers'
require './base'
require './statements'
require './params'
require './code'
require './literal'
require './identifier'

require './op'
require './access'
require './assign'
require './call'
require './flow'
require './range'
require './splat'
require './tag'
require './selector'
require './vars'
require './defer'
require './utils'
require './scope'

# AST.register :if, AST.If, []


# def AST.op op, left, right
# 	AST.Op.new(op,left,right)

# def AST.cond cond, body, alt
# 	AST.If.new(cond, body)
AST.SELF = AST.Self.new
AST.SUPER = AST.Super.new
AST.TRUE = AST.True.new('true')
AST.FALSE = AST.False.new('false')
AST.ARGUMENTS = AST.ArgsReference.new('arguments')
AST.EMPTY = ''
AST.NULL = 'null'

AST.RESERVED = ['default','native','enum','with']
AST.RESERVED_REGEX = /^(default|native|enum|with)$/

AST.UNION = AST.Const.new('union$')
AST.INTERSECT = AST.Const.new('intersect$')
AST.CLASSDEF = AST.Const.new('imba$class')
AST.TAGDEF = AST.Const.new('Imba.Tag.define')
AST.NEWTAG = AST.Identifier.new("tag$")

# require the parser itself?
# Are we sure?
AST.Imba = require('../worker')