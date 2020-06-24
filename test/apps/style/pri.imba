tag app-item
	css fw:300
	
tag app-item2
	css @force fw:300

tag app-root

	def render
		<self.app>
			<app-item$a1[fw:400]>
			<app-item2$a2[fw:400]>

imba.mount(let app = <app-root>)

test do
	eqcss app.$a1, 400
	eqcss app.$a2, 300