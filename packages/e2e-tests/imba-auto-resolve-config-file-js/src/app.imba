tag app
	count = 1
	<self>
		<h1[c:liloc4 bg:pink3]> "Hello {import.meta.env.VITE_LANG}"
		<button @click=count++> "Count is {count}"

imba.mount <app>