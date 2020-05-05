const items = ['one','two','three','four']

const labels = [
	{color: 'red', title: 'bug'}
	{color: 'blue', title: 'feature'}
]

tag x-app
	
	def render
		<self>
			<button.(purple-400 hover:blue-600)> "Welcome"
			<p.(bg-red-200)> "Decorators"
			<p.(bg-red-200/10)> "Decorators"
			<p.(bg-red-200/20 red-900 text-6xl)> "Decorators"
				

imba.mount <x-app .(block p(10))>