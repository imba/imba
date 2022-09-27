"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var cp = require("child_process");
var path = require("path");
var yaml = require("js-yaml");
var plist = require("plist");

function readYaml(fileName) {
    var text = fs.readFileSync(fileName, "utf8");
    return yaml.safeLoad(text);
}

function transformGrammarRule(rule, propertyNames, transformProperty) {
    for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
        var propertyName_1 = propertyNames_1[_i];
        var value = rule[propertyName_1];
        if (typeof value === 'string') {
            rule[propertyName_1] = transformProperty(value);
        }
    }
    for (var propertyName in rule) {
        var value = rule[propertyName];
        if (typeof value === 'object') {
            transformGrammarRule(value, propertyNames, transformProperty);
        }
    }
}
function transformGrammarRepository(grammar, propertyNames, transformProperty) {
    var repository = grammar.repository;
    for (var key in repository) {
        transformGrammarRule(repository[key], propertyNames, transformProperty);
    }
}

function replacePatternVariables(pattern, variableReplacers) {
    var result = pattern;
    for (var _i = 0, variableReplacers_1 = variableReplacers; _i < variableReplacers_1.length; _i++) {
        var _a = variableReplacers_1[_i], variableName = _a[0], value = _a[1];
        result = result.replace(variableName, value);
    }
    return result;
}
function updateGrammarVariables(grammar, variables) {
    delete grammar.variables;
    var variableReplacers = [];
    for (var variableName in variables) {
        // Replace the pattern with earlier variables
        var pattern = replacePatternVariables(variables[variableName], variableReplacers);
        variableReplacers.push([new RegExp("{{" + variableName + "}}", "gim"), pattern]);
    }
    transformGrammarRepository(grammar, ["begin", "end", "match"], function (pattern) { return replacePatternVariables(pattern, variableReplacers); });
    return grammar;
}
function buildGrammar(src) {
    console.log(`${src} building`);
    let content = readYaml(src);
    let grammar = updateGrammarVariables(content, content.variables);
    // var grammar = getTsGrammar(function (grammarVariables) { return grammarVariables; });
    var text = plist.build(grammar);
    var xmlDest = src.replace('YAML-','').replace('3','')
    fs.writeFileSync(xmlDest, text);
    var jsonDest = xmlDest + ".json"
	const jsonLang = JSON.stringify(content, null, 2)
    fs.writeFileSync(jsonDest, jsonLang);
    console.log(`${src} built`);
}


let src = path.resolve(__dirname,'..','syntaxes','imba.YAML-tmLanguage')

fs.watchFile(src, (curr, prev) => {
  console.log(`${src} file Changed`);
  buildGrammar(src);
});

/*
let themesrc = path.resolve(__dirname,'..','Imba.theme.imba')
fs.watchFile(themesrc, (curr, prev) => {
  console.log(`${themesrc} file Changed`);
  cp.execSync('npm run build-theme')
});

console.log(src,themesrc);
*/
buildGrammar(src);

// cp.execSync('npm run build-theme');
// buildTheme();
