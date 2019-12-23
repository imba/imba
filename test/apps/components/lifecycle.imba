

tag app-component

	def setup
		self

	def mount
		console.info 'component-mount'

	def unmount
		console.info 'component-unmount'


tag app-root

	def mount
		console.info 'root-mount'

	def unmount
		console.info 'root-unmount'

	def render
		<self>
			<h1> "Application"
			<app-component name='one'>
			<app-component name='two'>

imba.mount <app-root>

describe 'Lifecycle' do
	yes