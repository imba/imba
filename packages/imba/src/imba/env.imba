import np from 'path'

export const env = new class Env

	# TODO: remove pm2 hack
	# when launching pm2 with an ecosystem file,
	# process.argv[1] is ProcessContainerFork.js
	# the problem with using process.env.pm_exec_path is if the shell is inherited
	# from another process that was started with pm2, the pm_exec_path environment variable
	# will also be inherited, which may or may not be a completely different path.
	get rootDir
		process.env.IMBA_OUTDIR or np.dirname(process.env.pm_exec_path or process.argv[1])
	
	get publicPath
		np.resolve(rootDir,process.env.IMBA_PUBDIR or global.IMBA_PUBDIR or 'public')
