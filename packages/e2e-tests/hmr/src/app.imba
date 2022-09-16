tag Counter < button
	count = 1
	<self[c:amber7] @click=count++> "inline counter {count}"
tag app
	<self>
		<h1[c:amber4 fs:lg]> "Hello {import.meta.env.VITE_LANG}"
		<Counter>

imba.mount <app>