var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var imba = require('./lib/compiler');

var cacheDir = process.env.IMBA_CACHE_DIR;
var cachePrefix

if(cacheDir){
	cacheDir = path.resolve(process.cwd(),cacheDir);
	cachePrefix = require('./package.json').version
}

function cacheFile(filename) {	
	var content;

	if(cacheDir) {
		var cacheName = cachePrefix + '-' + filename.replace(/\//g,'__') + '.js';
		var cachePath = path.join(cacheDir,cacheName);

		try {
			var cacheTime = fs.statSync(cachePath).mtime;
			var sourceTime = fs.statSync(filename).mtime;
			if (cacheTime > sourceTime) {
				content = fs.readFileSync(cachePath, 'utf8');
			}
		} catch (err) {
			
		}
	}

	if (!content) {
		var compiled = imba.compile(fs.readFileSync(filename,'utf8'),{
			filename: filename,
			sourcePath: filename,
			target: 'node',
			evaling: true
		});

		content = compiled.js;

		if(cacheDir){
			try {
				fs.writeFileSync(cachePath, content, 'utf8');
			} catch (err) {
				console.warn("Imba could not cache file in ",cachePath);
			}
		}
	}

	return content;
}


if(require.extensions) {
	var Module = require('module');
	
	require.extensions['.imba'] = function (mod,filename){
		var content = cacheFile(filename);
		return mod._compile(content,filename);
	};
	
	var findExtension = function (filename){
		var curExtension,extensions;
		extensions = path.basename(filename).split('.');
		if(extensions[0] == '') {
			extensions.shift();
		};
		
		while(extensions.shift()){
			curExtension = '.' + extensions.join('.');
			if(Module._extensions[curExtension]) {
				return curExtension;
			};
		};
		return '.js';
	};

	Module.prototype.load = function (filename){
		this.filename = filename;
		this.paths = Module._nodeModulePaths(path.dirname(filename));
		var ext = findExtension(filename);
		Module._extensions[ext](this,filename);
		return this.loaded = true;
	};

} else if(require.registerExtension) {
	require.registerExtension('.imba',function (content){
		return imba.compile(content, {target: 'node'}).js;
	});
};


if(cp) {
	var nodefork = cp.fork;
	var binary = require.resolve('./bin/imba');
	
	cp.fork = function (filepath,args,options){
		if(args === undefined) args = [];
		if(options === undefined) options = {};
		var ext = path.extname(filepath);
		
		// to be able to fork without specifying extension
		// not sure how else to solve this - but it is relatively important
		// when you want to be able to run the same codebase directly or compiled
		if(ext != '.js' && ext != '.imba' && fs.existsSync(filepath + '.imba')) {
			filepath = filepath + '.imba';
		};
		
		if(filepath.match(/\.(imba)$/)) {
			args = [filepath].concat(args);
			filepath = binary;
		};
		
		return nodefork(filepath,args,options);
	};
};
