import np from 'path'

export const env = new class Env
	get rootDir
		process.env.IMBA_OUTDIR or np.dirname(process.argv[1])
	
	get publicPath
		np.resolve(rootDir,process.env.IMBA_PUBDIR or global.IMBA_PUBDIR or 'public')
