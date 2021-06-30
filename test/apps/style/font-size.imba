tag App

	def render
		<self.app>
			<div[fs:sm-]> '13px'
			<div[fs:sm]> '14px'
			<div[fs:md-]> '15px'
			<div[fs:md]> '16px'
			<div[fs:lg]> '18px'
			<div[fs:xl]> '20px'
			<div[fs:2xl]> '24px'

imba.mount(let app = <App>)

test do
	for child in app.children
		eqcss child, {fontSize: child.innerText}