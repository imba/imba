# import createMakeHotFactory from './lib/make-hot'
import path from 'path'
import {name, version} from "../../package.json"

const resolveAbsoluteImport = do(target) resolve(__dirname, target)

def createMakeHotFactory(pkg, resolveAbsoluteImport)
	do(input)
		input
		do(opts)
			const {id, hotOptions, originalCode, compiledCode} = opts
			let suffix = "console.log('imba hmr from {id}')\n"
			console.log(compiledCode)
			# suffix += """
			# console.log(`{compiledCode}`)
			# """
			suffix += "\n"
			suffix += '''
				if (import.meta.hot) {
					import.meta.hot.accept((newModule) => {
						if (newModule) {
							// newModule is undefined when SyntaxError happened
							console.log('updated: count is now ', newModule)
							
							// if(state){ state = newModule.default}
						}
					})
				}
			'''
			return """
			{compiledCode}
			{suffix}
			"""
			compiledCode
export const createMakeHot = createMakeHotFactory
	pkg:
		name: name
		version: version
	resolveAbsoluteImport: resolveAbsoluteImport


