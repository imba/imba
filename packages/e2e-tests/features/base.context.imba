export class BaseContext
	get makeVersion10?
		meta.decorators..makeVersion10

	get retry
		meta.decorators..retry

	get version
		makeVersion10? ? "10": "2"