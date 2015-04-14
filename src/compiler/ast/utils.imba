
class AST.Util < AST.Node

	prop args

	def initialize args
		@args = args
		
	# this is how we deal with it now
	def self.extend a,b
		AST.Util.Extend.new([a,b])

	def self.repeat str, times
		var res = ''
		while times > 0
			if times % 2 == 1
				res += str
			str += str
			times >>= 1
		return res
		
		

	def self.keys obj
		var l = AST.Const.new("Object")
		var r = AST.Identifier.new("keys")
		CALL(OP('.',l,r),[obj])

	def self.len obj, cache
		# p "LEN HELPER".green
		var r = AST.Identifier.new("length")
		var node = OP('.', obj, r)
		node.cache(force: yes, type: 'len') if cache
		return node

	def self.indexOf lft, rgt
		var node = AST.Util.IndexOf.new([lft,rgt])
		# node.cache(force: yes, type: 'iter') if cache
		return node

	def self.slice obj, a, b
		var slice = AST.Identifier.new("slice")
		return CALL(OP('.',obj,slice),[a.toAST,b && b.toAST].compact)
	
	def self.iterable obj, cache
		var node = AST.Util.Iterable.new([obj])
		node.cache(force: yes, type: 'iter') if cache
		return node



	def self.union a,b
		AST.Util.Union.new([a,b])
		# CALL(AST.UNION,[a,b])

	def self.intersect a,b
		AST.Util.Intersect.new([a,b])
		# CALL(AST.INTERSECT,[a,b])

	def self.counter start, cache
		var node = AST.Num.new(start)
		node.cache(force: yes, type: 'counter') if cache
		return node

	def self.array size, cache
		var node = AST.Util.Array.new([size])
		node.cache(force: yes, type: 'list') if cache
		return node

	def self.defineTag type, ctor, supr
		CALL(AST.TAGDEF,[type,ctor,supr])

	# hmm
	def self.defineClass name, supr, initor
		CALL(AST.CLASSDEF,[name or initor,sup])


	def self.toAST obj
		# deep converter that takes arrays etc and converts into ast
		self

	def js
		"helper"

class AST.Util.Union < AST.Util

	def helper
		'''
		union$ = function(a,b){
			if(a && a.__union) return a.__union(b);

			var u = a.slice(0);
			for(var i=0,l=b.length;i<l;i++) if(u.indexOf(b[i]) == -1) u.push(b[i]);
			return u;
		};

		'''
		

	def js
		scope__.root.helper(self,helper)
		# When this is triggered, we need to add it to the top of file?
		"union$({args.compact.c.join(',')})"

class AST.Util.Intersect < AST.Util

	def helper
		'''
		intersect$ = function(a,b){
			if(a && a.__intersect) return a.__intersect(b);
			var res = [];
			for(var i=0, l=a.length; i<l; i++) {
				var v = a[i];
				if(b.indexOf(v) != -1) res.push(v);
			}
			return res;
		};

		'''

	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"intersect$({args.compact.c.join(',')})"

class AST.Util.Extend < AST.Util

	def js
		# When this is triggered, we need to add it to the top of file?
		"extend$({args.compact.c.join(',')})"

class AST.Util.IndexOf < AST.Util

	def helper
		'''
		idx$ = function(a,b){
			return (b && b.indexOf) ? b.indexOf(a) : [].indexOf.call(a,b);
		};

		'''
		

	def js
		scope__.root.helper(self,helper)
		# When this is triggered, we need to add it to the top of file?
		"idx$({args.compact.c.join(',')})"

class AST.Util.Subclass < AST.Util

	def helper
		# should also check if it is a real promise
		'''
		// helper for subclassing
		function subclass$(obj,sup) {
			for (var k in sup) {
				if (sup.hasOwnProperty(k)) obj[k] = sup[k];
			};
			// obj.__super__ = sup;
			obj.prototype = Object.create(sup.prototype);
			obj.__super__ = obj.prototype.__super__ = sup.prototype;
			obj.prototype.initialize = obj.prototype.constructor = obj;
		};

		'''

	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"subclass$({args.compact.c.join(',')});\n"

class AST.Util.Promisify < AST.Util

	def helper
		# should also check if it is a real promise
		"function promise$(a)\{ return a instanceof Array ? Promise.all(a) : (a && a.then ? a : Promise.resolve(a)); \}"
		
	def js
		# When this is triggered, we need to add it to the top of file?
		scope__.root.helper(self,helper)
		"promise$({args.compact.c.join(',')})"

class AST.Util.Class < AST.Util

	def js
		# When this is triggered, we need to add it to the top of file?
		"class$({args.compact.c.join(',')})"

class AST.Util.Iterable < AST.Util

	def helper
		# now we want to allow nil values as well - just return as empty collection
		# should be the same for for own of I guess
		"function iter$(a)\{ return a ? (a.toArray ? a.toArray() : a) : []; \};"
		
	def js
		return args[0].c if args[0] isa AST.Arr # or if we know for sure that it is an array
		# only wrap if it is not clear that this is an array?
		scope__.root.helper(self,helper)
		return "iter$({args[0].c})"

class AST.Util.IsFunction < AST.Util

	def js
		# p "IS FUNCTION {args[0]}"
		# just plain check for now
		"{args[0].c}"
		# "isfn$({args[0].c})"
		# "typeof {args[0].c} == 'function'"
		

class AST.Util.Array < AST.Util

	def js
		# When this is triggered, we need to add it to the top of file?
		"new Array({args.compact.c})"