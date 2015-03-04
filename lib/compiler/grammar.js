(function(){
function iter$(a){ return a ? (a.toArray ? a.toArray() : a) : []; }
var jison = require('jison');
Parser = jison.Parser;
var unwrap = /^function\s*\(\)\s*\{\s*return\s*([\s\S]*);\s*\}/;

var o = function (patternString,action,options){
	var match;
	patternString = patternString.replace(/\s{2,}/g,' ');
	var patternCount = patternString.split(' ').length;
	
	if(!action) {
		return [patternString, '$$ = $1;', options];
	};
	
	if(match = unwrap.exec(action)) {
		action = match[1];
	} else {
		action = ("(" + action + "())");
	};
	action = action.replace(/\bA(\d+)/g,'$$$1');
	action = action.replace(/\bnew /g,'$&yy.');
	action = action.replace(/\b(?:Block\.wrap|extend)\b/g,'yy.$&');
	var loc = function (first,last){
		return (!last) ? (("yy.LOC(@" + first + ",@1)")) : (("yy.LOC(@" + first + ", @" + last + ")"));
	};
	action = action.replace(/L\(([0-9]*)\)/g,loc('$1'));
	action = action.replace(/L\(([0-9]*),\s*([0-9]*)\)/g,loc('$1','$2'));
	return [patternString, ("$$ = " + action + ";"), options];
};
var grammar = {Root: [o('',function (){
	return new Root([]);
}), o('Body',function (){
	return new Root(A1);
}), o('Block TERMINATOR')],Body: [o('Line',function (){
	return Block.wrap([A1]);
}), o('Body TERMINATOR Line',function (){
	return A1.push(A3,A2);
}), o('Body TERMINATOR')],Line: [o('Splat'), o('Expression'), o('Line , Expression',function (){
	return A1.addExpression(A3);
}), o('Line , Splat',function (){
	return A1.addExpression(A3);
}), o('Statement')],Statement: [o('Return'), o('Throw'), o('Comment'), o('STATEMENT',function (){
	return new Literal(A1);
}), o('BREAK',function (){
	return new BreakStatement(A1);
}), o('BREAK CALL_START Expression CALL_END',function (){
	return new BreakStatement(A1,A3);
}), o('CONTINUE',function (){
	return new ContinueStatement(A1);
}), o('CONTINUE CALL_START Expression CALL_END',function (){
	return new ContinueStatement(A1,A3);
}), o('DEBUGGER',function (){
	return new DebuggerStatement(A1);
})],TupleStatement: [],TupleStuff: [o('Arg',function (){
	return [A1];
}), o('ArgList , Arg',function (){
	return A1.concat(A3);
}), o('ArgList OptComma TERMINATOR Arg',function (){
	return A1.concat(A4);
}), o('INDENT ArgList OptComma OUTDENT',function (){
	return A2;
}), o('ArgList OptComma INDENT ArgList OptComma OUTDENT',function (){
	return A1.concat(A4);
})],Expression: [o('Await'), o('Value'), o('Invocation'), o('Code'), o('Operation'), o('Assign'), o('If'), o('Ternary'), o('Try'), o('While'), o('For'), o('Switch'), o('Class'), o('Module'), o('TagDeclaration'), o('Tag'), o('Property')],TagSelector: [o('SELECTOR_START',function (){
	return new Selector([],{type: A1});
}), o('TagSelector TagSelectorType',function (){
	return A1.add(new SelectorType(A2),'tag');
}), o('TagSelector SELECTOR_NS',function (){
	return A1.add(new SelectorNamespace(A2),'ns');
}), o('TagSelector SELECTOR_ID',function (){
	return A1.add(new SelectorId(A2),'id');
}), o('TagSelector SELECTOR_CLASS',function (){
	return A1.add(new SelectorClass(A2),'class');
}), o('TagSelector . { Expression }',function (){
	return A1.add(new SelectorClass(A4),'class');
}), o('TagSelector # { Expression }',function (){
	return A1.add(new SelectorId(A4),'id');
}), o('TagSelector SELECTOR_COMBINATOR',function (){
	return A1.add(new SelectorCombinator(A2),'sep');
}), o('TagSelector SELECTOR_PSEUDO_CLASS',function (){
	return A1.add(new SelectorPseudoClass(A2),'pseudoclass');
}), o('TagSelector SELECTOR_GROUP',function (){
	return A1.group();
}), o('TagSelector UNIVERSAL_SELECTOR',function (){
	return A1.add(new SelectorUniversal(A2),'universal');
}), o('TagSelector [ Identifier ]',function (){
	return A1.add(new SelectorAttribute(A3),'attr');
}), o('TagSelector [ Identifier SELECTOR_ATTR_OP TagSelectorAttrValue ]',function (){
	return A1.add(new SelectorAttribute(A3,A4,A5),'attr');
})],TagSelectorType: [o('SELECTOR_TAG',function (){
	return new TagTypeIdentifier(A1);
})],Selector: [o('TagSelector SELECTOR_END',function (){
	return A1;
})],TagSelectorAttrValue: [o('IDENTIFIER',function (){
	return A1;
}), o('AlphaNumeric',function (){
	return A1;
}), o('{ Expression }',function (){
	return A2;
})],Tag: [o('TAG_START TagOptions TagAttributes TAG_END',function (){
	return A2.set({attributes: A3});
}), o('TAG_START TagOptions TagAttributes TAG_END TagBody',function (){
	return A2.set({attributes: A3,body: A5});
}), o('TAG_START { Expression } TAG_END',function (){
	return new TagWrapper(A3,A1,A5);
})],TagTypeName: [o('Self',function (){
	return A1;
}), o('IDENTIFIER',function (){
	return new TagTypeIdentifier(A1);
}), o('',function (){
	return new TagTypeIdentifier('div');
})],TagOptions: [o('TagTypeName',function (){
	return new Tag({type: A1});
}), o('TagOptions . SYMBOL',function (){
	return A1.addSymbol(A3);
}), o('TagOptions INDEX_START Expression INDEX_END',function (){
	return A1.addIndex(A3);
}), o('TagOptions . IDENTIFIER',function (){
	return A1.addClass(A3);
}), o('TagOptions . { Expression }',function (){
	return A1.addClass(A4);
}), o('TagOptions # IDENTIFIER',function (){
	return A1.set({id: A3});
}), o('TagOptions Ivar',function (){
	return A1.set({ivar: A2});
}), o('TagOptions # { Expression }',function (){
	return A1.set({id: A4});
})],TagAttributes: [o('',function (){
	return [];
}), o('TagAttr',function (){
	return [A1];
}), o('TagAttributes , TagAttr',function (){
	return A1.concat(A3);
}), o('TagAttributes OptComma TERMINATOR TagAttr',function (){
	return A1.concat(A4);
})],TagAttr: [o('TAG_ATTR',function (){
	return new TagAttr(A1,A1);
}), o('TAG_ATTR = TagAttrValue',function (){
	return new TagAttr(A1,A3);
})],TagAttrValue: [o('Expression')],TagBody: [o('INDENT ArgList OUTDENT',function (){
	return A2;
}), o('CALL_START ArgList CALL_END',function (){
	return A2;
})],TagTypeDef: [o('Identifier',function (){
	return new TagDesc(A1);
}), o('TagTypeDef . Identifier',function (){
	return A1.classes(A3);
})],TagDeclaration: [o('TagDeclarationBlock',function (){
	return A1;
}), o('EXTEND TagDeclarationBlock',function (){
	return A2.set({extension: true});
})],TagDeclarationBlock: [o('TAG TagType',function (){
	return new TagDeclaration(A2);
}), o('TAG TagType Block',function (){
	return new TagDeclaration(A2,null,A3);
}), o('TAG TagType COMPARE TagType',function (){
	return new TagDeclaration(A2,A4);
}), o('TAG TagType COMPARE TagType Block',function (){
	return new TagDeclaration(A2,A4,A5);
})],TagDeclKeywords: [o(''), o('EXTEND',function (){
	return ['extend'];
})],TagType: [o('TAG_TYPE',function (){
	return new TagTypeIdentifier(A1);
}), o('TAG_ID',function (){
	return new TagTypeIdentifier(A1);
})],Block: [o('INDENT OUTDENT',function (){
	return new Block([]).set({ends: [A1, A2]});
}), o('INDENT Body OUTDENT',function (){
	return A2.set({ends: [A1, A3]});
})],Identifier: [o('IDENTIFIER',function (){
	return new Identifier(A1);
})],TagId: [o('IDREF',function (){
	return new TagId(A1);
}), o('# Identifier',function (){
	return new TagId(A2);
})],Symbol: [o('SYMBOL',function (){
	return new Symbol(A1);
})],Ivar: [o('IVAR',function (){
	return new Ivar(A1);
}), o('CVAR',function (){
	return new Ivar(A1);
})],Gvar: [o('GVAR',function (){
	return new Gvar(A1);
})],Const: [o('CONST',function (){
	return new Const(A1);
})],Argvar: [o('ARGVAR',function (){
	return new Argvar(A1);
})],AlphaNumeric: [o('NUMBER',function (){
	return new Num(A1);
}), o('STRING',function (){
	return new Str(A1);
}), o('Symbol')],Literal: [o('AlphaNumeric'), o('JS',function (){
	return new Literal(A1);
}), o('REGEX',function (){
	return new RegExp(A1);
}), o('BOOL',function (){
	return new Bool(A1);
})],Assign: [o('Assignable = Expression',function (){
	return new Assign("=",A1,A3);
}), o('Assignable = INDENT Expression OUTDENT',function (){
	return new Assign("=",A1,A4);
})],AssignObj: [o('ObjAssignable',function (){
	return new ObjAttr(A1);
}), o('ObjAssignable : Expression',function (){
	return new ObjAttr(A1,A3,'object');
}), o('ObjAssignable :\
			 INDENT Expression OUTDENT',function (){
	return new ObjAttr(A1,A4,'object');
}), o('Comment')],ObjAssignable: [o('Identifier'), o('Const'), o('AlphaNumeric'), o('Ivar'), o('Gvar'), o('( Expression )',function (){
	return A2;
})],Return: [o('RETURN Expression',function (){
	return new Return(A2);
}), o('RETURN Arguments',function (){
	return new Return(A2);
}), o('RETURN',function (){
	return new Return();
})],Comment: [o('HERECOMMENT',function (){
	return new Comment(A1);
})],Code: [o('Method'), o('Do'), o('Begin')],Begin: [o('BEGIN Block',function (){
	return new Begin(A2);
})],Do: [o('DO Block',function (){
	return new Lambda([],A2,null,null,{bound: true});
}), o('DO BLOCK_PARAM_START ParamList BLOCK_PARAM_END Block',function (){
	return new Lambda(A3,A5,null,null,{bound: true});
}), o('{ BLOCK_PARAM_START ParamList BLOCK_PARAM_END Block }',function (){
	return new Lambda(A3,A5,null,null,{bound: true});
})],Property: [o('PROP PropertyIdentifier Object',function (){
	return new PropertyDeclaration(A2,A3);
}), o('PROP PropertyIdentifier CALL_START Object CALL_END',function (){
	return new PropertyDeclaration(A2,A4);
}), o('PROP PropertyIdentifier',function (){
	return new PropertyDeclaration(A2,null);
})],PropertyIdentifier: [o('Identifier'), o('{ Expression }',function (){
	return A2;
})],TupleAssign: [o('VAR Identifier , Expression',function (){
	return A1;
})],VarDeclaration: [],MultiAssignable: [o('',function (){
	return [];
}), o('MultiAssignmentVar',function (){
	return [A1];
}), o('MultiAssignable , MultiAssignmentVar',function (){
	return A1.concat(A3);
}), o('( MultiAssignable )',function (){
	return A2;
})],MultiAssignmentValues: [o('MultiAssignmentValue',function (){
	return [A1];
}), o('MultiAssignmentValues , MultiAssignmentValue',function (){
	return A1.concat(A3);
})],MultiAssignmentValue: [o('Value'), o('Invocation')],SingleAssignmentValue: [o('IfBlock'), o('ForBlock'), o('Assign')],MultiAssignmentVar: [o('Identifier',function (){
	return new VarName(A1);
}), o('SPLAT Identifier',function (){
	return new VarName(A2,A1);
})],Method: [o('MethodDeclaration',function (){
	return A1;
}), o('GLOBAL MethodDeclaration',function (){
	return A2.set({global: A1});
}), o('EXPORT MethodDeclaration',function (){
	return A2.set({export: A1});
})],MethodDeclaration: [o('DEF MethodScope MethodScopeType MethodIdentifier CALL_START ParamList CALL_END DEF_BODY MethodBody',function (){
	return new MethodDeclaration(A6,A9,A4,A2,A3);
}), o('DEF MethodScope MethodScopeType MethodIdentifier DEF_BODY MethodBody',function (){
	return new MethodDeclaration([],A6,A4,A2,A3);
}), o('DEF MethodIdentifier CALL_START ParamList CALL_END DEF_BODY MethodBody',function (){
	return new MethodDeclaration(A4,A7,A2,null);
}), o('DEF MethodIdentifier DEF_BODY MethodBody',function (){
	return new MethodDeclaration([],A4,A2,null);
}), o('DEF MethodScope MethodScopeType MethodIdentifier CALL_START ParamList CALL_END DEF_FRAGMENT MethodBody',function (){
	A9.expressions = [new Arr(A9.expressions)];
	return new MethodDeclaration(A6,A9,A4,A2,A3);
}), o('DEF MethodScope MethodScopeType MethodIdentifier DEF_FRAGMENT MethodBody',function (){
	A6.expressions = [new Arr(A6.expressions)];
	return new MethodDeclaration([],A6,A4,A2,A3);
}), o('DEF MethodIdentifier CALL_START ParamList CALL_END DEF_FRAGMENT MethodBody',function (){
	A7.expressions = [new Arr(A7.expressions)];
	return new MethodDeclaration(A4,A7,A2,null);
}), o('DEF MethodIdentifier DEF_FRAGMENT MethodBody',function (){
	A4.expressions = [new Arr(A4.expressions)];
	return new MethodDeclaration([],A4,A2,null);
})],MethodScopeType: [o('.',function (){
	return {static: true};
}), o('#',function (){
	return {};
})],MethodIdentifier: [o('Identifier'), o('Const'), o('{ Expression }',function (){
	return A2;
})],MethodReceiver: [],MethodBody: [o('Block'), o('Do',function (){
	return A1.body();
})],MethodScope: [o('MethodIdentifier'), o('This'), o('Self'), o('Gvar')],FuncGlyph: [],OptComma: [o(''), o(',')],ParamList: [o('',function (){
	return [];
}), o('Param',function (){
	return [A1];
}), o('ParamList , Param',function (){
	return A1.concat(A3);
})],Param: [o('Object',function (){
	return new NamedParams(A1);
}), o('Array',function (){
	return new ArrayParams(A1);
}), o('ParamVar',function (){
	return new RequiredParam(A1);
}), o('SPLAT ParamVar',function (){
	return new SplatParam(A2,null,A1);
}), o('LOGIC ParamVar',function (){
	return new BlockParam(A2,null,A1);
}), o('BLOCK_ARG ParamVar',function (){
	return new BlockParam(A2,null,A1);
}), o('ParamVar = Expression',function (){
	return new OptionalParam(A1,A3,A2);
})],ParamVar: [o('Identifier')],Splat: [o('SPLAT Expression',function (){
	return SPLAT(A2);
})],Reference: [o('Value Symbol',function (){
	return new Reference(A1,A2);
})],VarReference: [o('VAR SPLAT VarIdentifier',function (){
	return SPLAT(new VarReference(A3,A1),A2);
}), o('VAR VarIdentifier',function (){
	return new VarReference(A2,A1);
}), o('LET VarIdentifier',function (){
	return new VarReference(A2,A1);
}), o('LET SPLAT VarIdentifier',function (){
	return SPLAT(new VarReference(A3,A1),A2);
}), o('EXPORT VarReference',function (){
	return A2.set({export: A1});
})],VarIdentifier: [o('Const'), o('Identifier')],SimpleAssignable: [o('Const',function (){
	return A1;
}), o('Ivar',function (){
	return new IvarAccess('.',null,A1);
}), o('Gvar',function (){
	return A1;
}), o('Argvar',function (){
	return A1;
}), o('Self',function (){
	return A1;
}), o('Identifier',function (){
	return new VarOrAccess(A1);
}), o('VarReference',function (){
	return A1;
}), o('Reference',function (){
	return A1;
}), o('Value . NEW',function (){
	return new New(A1);
}), o('Value . Super',function (){
	return new SuperAccess('.',A1,A3);
}), o('Value . Identifier',function (){
	return new PropertyAccess('.',A1,A3);
}), o('Value . Ivar',function (){
	return new IvarAccess('.',A1,A3);
}), o('Value -> Identifier',function (){
	return new ObjectAccess('.',A1,A3);
}), o('Value . Symbol',function (){
	return new ObjectAccess('.',A1,new Identifier(A3.value()));
}), o('Value . Const',function (){
	return new ConstAccess('.',A1,A3);
}), o('Value . NUMBER',function (){
	return OP('.',A1,new Num(A3));
}), o('Invocation . Identifier',function (){
	return new PropertyAccess('.',A1,A3);
}), o('Invocation -> Identifier',function (){
	return new ObjectAccess('.',A1,A3);
}), o('Invocation . Symbol',function (){
	return new ObjectAccess('.',A1,new Identifier(A3.value()));
}), o('Invocation . Const',function (){
	return new ConstAccess('.',A1,A3);
}), o('Invocation . Ivar',function (){
	return new IvarAccess('.',A1,A3);
}), o('Value INDEX_START IndexValue INDEX_END',function (){
	return new IndexAccess('.',A1,A3);
}), o('Invocation INDEX_START IndexValue INDEX_END',function (){
	return new IndexAccess('.',A1,A3);
})],Super: [o('SUPER',function (){
	return AST.SUPER;
})],Assignable: [o('SimpleAssignable'), o('Array',function (){
	return A1;
}), o('Object',function (){
	return A1;
})],Await: [o('AWAIT Expression',function (){
	return new Await(A2);
})],Value: [o('Assignable'), o('Super',function (){
	return A1;
}), o('Literal',function (){
	return A1;
}), o('Parenthetical',function (){
	return A1;
}), o('Range',function (){
	return A1;
}), o('ARGUMENTS',function (){
	return AST.ARGUMENTS;
}), o('This'), o('TagId',function (){
	return A1;
}), o('Selector')],IndexArgList: [o('Arg , Arg',function (){
	return [A1, A3];
}), o('ArgList , Arg',function (){
	return A1.concat(A3);
}), o('ArgList OptComma TERMINATOR Arg',function (){
	return A1.concat(A4);
}), o('INDENT ArgList OptComma OUTDENT',function (){
	return A2;
}), o('ArgList OptComma INDENT ArgList OptComma OUTDENT',function (){
	return A1.concat(A4);
})],IndexValue: [o('Expression',function (){
	return new Index(A1);
}), o('Slice',function (){
	return new Slice(A1);
})],Object: [o('{ AssignList OptComma }',function (){
	return new Obj(A2,A1.generated);
})],AssignList: [o('',function (){
	return [];
}), o('AssignObj',function (){
	return [A1];
}), o('AssignList , AssignObj',function (){
	return A1.concat(A3);
}), o('AssignList OptComma TERMINATOR AssignObj',function (){
	return A1.concat(A4);
}), o('AssignList OptComma INDENT AssignList OptComma OUTDENT',function (){
	return A1.concat(A4);
})],Class: [o('ClassStart',function (){
	return A1;
}), o('EXTEND ClassStart',function (){
	return A2.set({extension: A1});
}), o('LOCAL ClassStart',function (){
	return A2.set({local: A1});
}), o('EXPORT ClassStart',function (){
	return A2.set({export: A1});
}), o('EXPORT LOCAL ClassStart',function (){
	return A3.set({export: A1,local: A2});
})],ClassStart: [o('CLASS SimpleAssignable',function (){
	return new ClassDeclaration(A2,null,[]);
}), o('CLASS SimpleAssignable Block',function (){
	return new ClassDeclaration(A2,null,A3);
}), o('CLASS SimpleAssignable COMPARE Expression',function (){
	return new ClassDeclaration(A2,A4,[]);
}), o('CLASS SimpleAssignable COMPARE Expression Block',function (){
	return new ClassDeclaration(A2,A4,A5);
})],Module: [o('MODULE SimpleAssignable',function (){
	return new Module(A2);
}), o('MODULE SimpleAssignable Block',function (){
	return new Module(A2,null,A3);
})],Invocation: [o('Value OptFuncExist Arguments',function (){
	return new Call(A1,A3,A2);
}), o('Invocation OptFuncExist Arguments',function (){
	return new Call(A1,A3,A2);
}), o('Invocation Do',function (){
	A1.addBlock(A2);
	return A1;
})],SuperCall: [o('SUPER',function (){
	return new SuperReference(AST.SUPER);
}), o('SUPER SuperAccess',function (){
	return A1.access(A3);
})],SuperAccess: [o('. SUPER',function (){
	return A2;
})],OptFuncExist: [o('',function (){
	return false;
}), o('FUNC_EXIST',function (){
	return true;
})],Arguments: [o('CALL_START CALL_END',function (){
	return [];
}), o('CALL_START ArgList OptComma CALL_END',function (){
	return A2;
})],This: [o('THIS',function (){
	return new This(A1);
})],Self: [o('SELF',function (){
	return new Self(A1);
})],Array: [o('[ ]',function (){
	return new Arr([]);
}), o('[ ArgList OptComma ]',function (){
	return new Arr(A2);
})],RangeDots: [o('..',function (){
	return '..';
}), o('...',function (){
	return '...';
})],Range: [o('[ Expression RangeDots Expression ]',function (){
	return OP(A3,A2,A4);
})],Slice: [o('Expression RangeDots Expression',function (){
	return new Range(A1,A3,A2);
}), o('Expression RangeDots',function (){
	return new Range(A1,null,A2);
}), o('RangeDots Expression',function (){
	return new Range(null,A2,A1);
})],ArgList: [o('Arg',function (){
	return [A1];
}), o('ArgList , Arg',function (){
	return A1.concat(A3);
}), o('ArgList OptComma TERMINATOR Arg',function (){
	return A1.concat(A4);
}), o('INDENT ArgList OptComma OUTDENT',function (){
	return A2;
}), o('ArgList OptComma INDENT ArgList OptComma OUTDENT',function (){
	return A1.concat(A4);
})],Arg: [o('Expression'), o('Splat'), o('LOGIC')],SimpleArgs: [o('Expression'), o('SimpleArgs , Expression',function (){
	return [].concat(A1,A3);
})],Try: [o('TRY Block',function (){
	return new Try(A2);
}), o('TRY Block Catch',function (){
	return new Try(A2,A3);
}), o('TRY Block Finally',function (){
	return new Try(A2,null,A3);
}), o('TRY Block Catch Finally',function (){
	return new Try(A2,A3,A4);
})],Finally: [o('FINALLY Block',function (){
	return new Finally(A2);
})],Catch: [o('CATCH CATCH_VAR Block',function (){
	return new Catch(A3,A2);
})],Throw: [o('THROW Expression',function (){
	return new Throw(A2);
})],Parenthetical: [o('( Body )',function (){
	return new Parens(A2);
}), o('( INDENT Body OUTDENT )',function (){
	return new Parens(A3);
})],WhileSource: [o('WHILE Expression',function (){
	return new While(A2);
}), o('WHILE Expression WHEN Expression',function (){
	return new While(A2,{guard: A4});
}), o('UNTIL Expression',function (){
	return new While(A2,{invert: true});
}), o('UNTIL Expression WHEN Expression',function (){
	return new While(A2,{invert: true,guard: A4});
})],While: [o('WhileSource Block',function (){
	return A1.addBody(A2);
}), o('Statement  WhileSource',function (){
	return A2.addBody(Block.wrap([A1]));
}), o('Expression WhileSource',function (){
	return A2.addBody(Block.wrap([A1]));
}), o('Loop',function (){
	return A1;
})],Loop: [o('LOOP Block',function (){
	return new While(new Literal('true')).addBody(A2);
}), o('LOOP Expression',function (){
	return new While(new Literal('true')).addBody(Block.wrap([A2]));
})],For: [o('Statement  ForBody',function (){
	return A2.addBody([A1]);
}), o('Expression ForBody',function (){
	return A2.addBody([A1]);
}), o('ForBody    Block',function (){
	return A1.addBody(A2);
})],ForBlock: [o('ForBody Block',function (){
	return A1.addBody(A2);
})],ForBody: [o('FOR Range',function (){
	return {source: new Value(A2)};
}), o('ForStart ForSource',function (){
	return A2.configure({own: A1.own,name: A1[0],index: A1[1]});
})],ForStart: [o('FOR ForVariables',function (){
	return A2;
}), o('FOR OWN ForVariables',function (){
	A3.own = true;
	return A3;
})],ForValue: [o('Identifier'), o('Array',function (){
	return new Value(A1);
}), o('Object',function (){
	return new Value(A1);
})],ForVariables: [o('ForValue',function (){
	return [A1];
}), o('ForValue , ForValue',function (){
	return [A1, A3];
})],ForSource: [o('FORIN Expression',function (){
	return new ForIn({source: A2});
}), o('FOROF Expression',function (){
	return new ForOf({source: A2,object: true});
}), o('FORIN Expression WHEN Expression',function (){
	return new ForIn({source: A2,guard: A4});
}), o('FOROF Expression WHEN Expression',function (){
	return new ForOf({source: A2,guard: A4,object: true});
}), o('FORIN Expression BY Expression',function (){
	return new ForIn({source: A2,step: A4});
}), o('FORIN Expression WHEN Expression BY Expression',function (){
	return new ForIn({source: A2,guard: A4,step: A6});
}), o('FORIN Expression BY Expression WHEN Expression',function (){
	return new ForIn({source: A2,step: A4,guard: A6});
})],Switch: [o('SWITCH Expression INDENT Whens OUTDENT',function (){
	return new Switch(A2,A4);
}), o('SWITCH Expression INDENT Whens ELSE Block OUTDENT',function (){
	return new Switch(A2,A4,A6);
}), o('SWITCH INDENT Whens OUTDENT',function (){
	return new Switch(null,A3);
}), o('SWITCH INDENT Whens ELSE Block OUTDENT',function (){
	return new Switch(null,A3,A5);
})],Whens: [o('When'), o('Whens When',function (){
	return A1.concat(A2);
})],When: [o('LEADING_WHEN SimpleArgs Block',function (){
	return [new SwitchCase(A2,A3)];
}), o('LEADING_WHEN SimpleArgs Block TERMINATOR',function (){
	return [new SwitchCase(A2,A3)];
})],IfBlock: [o('IF Expression Block',function (){
	return new If(A2,A3,{type: A1});
}), o('IfBlock ELSE IF Expression Block',function (){
	return A1.addElse(new If(A4,A5,{type: A3}));
}), o('IfBlock ELIF Expression Block',function (){
	return A1.addElse(new If(A3,A4,{type: A2}));
}), o('IfBlock ELSE Block',function (){
	return A1.addElse(A3);
})],If: [o('IfBlock'), o('Statement  POST_IF Expression',function (){
	return new If(A3,Block.wrap([A1]),{type: A2,statement: true});
}), o('Expression POST_IF Expression',function (){
	return new If(A3,Block.wrap([A1]),{type: A2,statement: true});
})],Ternary: [o('Expression ? Expression : Expression',function (){
	var ifblock = new If(A1,Block.wrap([A3]),{type: 'if'});
	ifblock.addElse(Block.wrap([A5]));
	return ifblock;
})],Operation: [o('UNARY Expression',function (){
	return OP(A1,A2);
}), o('SQRT Expression',function (){
	return OP(A1,A2);
}), o('-     Expression',(function (v){
	return new Op('-',A2);
}),{prec: 'UNARY'}), o('+     Expression',(function (v){
	return new Op('+',A2);
}),{prec: 'UNARY'}), o('-- SimpleAssignable',function (){
	return OP('--',null,A2);
}), o('++ SimpleAssignable',function (){
	return OP('++',null,A2);
}), o('SimpleAssignable --',function (){
	return OP('--',A1,null,true);
}), o('SimpleAssignable ++',function (){
	return OP('++',A1,null,true);
}), o('Expression ?',function (){
	return new Existence(A1);
}), o('Expression +  Expression',function (){
	return OP('+',A1,A3);
}), o('Expression -  Expression',function (){
	return OP('-',A1,A3);
}), o('Expression MATH     Expression',function (){
	return OP(A2,A1,A3);
}), o('Expression SHIFT    Expression',function (){
	return OP(A2,A1,A3);
}), o('Expression COMPARE  Expression',function (){
	return OP(A2,A1,A3);
}), o('Expression LOGIC    Expression',function (){
	return OP(A2,A1,A3);
}), o('Expression RELATION Expression',function (){
	return (A2.charAt(0) == '!') ? (OP(A2.slice(1),A1,A3).invert()) : (OP(A2,A1,A3));
}), o('SimpleAssignable COMPOUND_ASSIGN Expression',function (){
	return OP(A2,A1,A3);
}), o('SimpleAssignable COMPOUND_ASSIGN INDENT Expression OUTDENT',function (){
	return OP(A2,A1,A4);
})]};
var operators = [['left', 'MSET'], ['left', '.', '?.', '::'], ['left', 'CALL_START', 'CALL_END'], ['nonassoc', '++', '--'], ['right', 'UNARY', 'THROW', 'SQRT'], ['left', 'MATH'], ['left', '+', '-'], ['left', 'SHIFT'], ['left', 'RELATION'], ['left', 'COMPARE'], ['left', 'LOGIC'], ['left', '?'], ['left', 'AWAIT'], ['nonassoc', 'INDENT', 'OUTDENT'], ['right', '=', ':', 'COMPOUND_ASSIGN', 'RETURN', 'THROW', 'EXTENDS'], ['right', 'FORIN', 'FOROF', 'BY', 'WHEN'], ['right', 'TAG_END'], ['right', 'IF', 'ELSE', 'FOR', 'DO', 'WHILE', 'UNTIL', 'LOOP', 'SUPER', 'CLASS', 'MODULE', 'TAG', 'EVENT', 'TRIGGER', 'TAG_END'], ['right', 'POST_IF'], ['right', 'NEW_TAG'], ['right', 'TAG_ATTR_SET'], ['right', 'SPLAT'], ['left', 'SELECTOR_START']];

var tokens = [];
var o1=grammar, name;
for(var name in o1){
	for(var i=0, ary=iter$(o1[name]), len=ary.length, alt, res=[]; i < len; i++){
		alt = ary[i];
		for(var j=0, items=iter$(alt[0].split(' ')), len_=items.length, token; j < len_; j++){
			token = items[j];
			if(!(grammar[token])) {
				tokens.push(token);
			};
		};
		if(name == 'Root') {
			alt[1] = ("return " + (alt[1]));
		};
		res.push(alt);
	};
	grammar[name] = res;
};
exports.parser = new Parser({tokens: tokens.join(' '),bnf: grammar,operators: operators.reverse(),startSymbol: 'Root'});
}())