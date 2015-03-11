
var fs = require 'fs'
var path = require 'path'
var cp = require 'child_process'
var imba = require './compiler/compiler'

if require:extensions
	var Module = require 'module'

	require:extensions['.imba'] = do |mod, filename|
		# console.log "require with extension! {filename}"
		var content = imba.compile(fs.readFileSync(filename, 'utf8'), filename: filename)
		mod._compile content, filename


	var findExtension = do |filename|
		var curExtension, extensions
		extensions = path.basename(filename).split('.')
		extensions.shift if extensions[0] == ''

		while extensions.shift
			curExtension = '.' + extensions.join('.')
			if Module:_extensions[curExtension]
				return curExtension
		return '.js'

	def Module#load filename
		# console.log "getting to Module#load",filename
		this:filename = filename
		this:paths = Module._nodeModulePaths path.dirname(filename)
		var ext = findExtension(filename)
		Module:_extensions[ext](this, filename)
		this:loaded = true
		
# 	Module::load = (filename) ->
# #   @filename = filename
# #   @paths = Module._nodeModulePaths path.dirname filename
# #   extension = findExtension filename
# #   Module._extensions[extension](this, filename)
# #   @loaded = true

elif require:registerExtension
	require.registerExtension '.imba' do |content|
		# console.log "in registerExtension!"
		imba.compile(content)


if cp
	var nodefork = cp:fork
	var binary = require:resolve('../bin/imba')

	def cp.fork filepath, args = [], options = {}
		# console.log "trying to fork from",process.cwd,process:execPath
		# console.log "trying to fork(!)",filepath,process:execPath,binary
		var ext = path.extname(filepath)

		# to be able to fork without specifying extension
		# not sure how else to solve this - but it is relatively important
		# when you want to be able to run the same codebase directly or compiled
		if ext != '.js' and ext != '.imba' and fs.existsSync(filepath + '.imba')
			filepath = filepath + '.imba'

		if filepath.match(/\.(imba)$/)
			args = [filepath].concat(args)
			filepath = binary

		return nodefork(filepath, args, options)

#     cp.fork = function(path, args, options) {
#       if (helpers.isCoffee(path)) {
#         if (!Array.isArray(args)) {
#           options = args || {};
#           args = [];
#         }
#         args = [path].concat(args);
#         path = binary;
#       }
#       return fork(path, args, options);
#     };
#   }