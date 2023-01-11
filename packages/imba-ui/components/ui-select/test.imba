import '.'

tag app

	items = ["hello", "world", "hi"]
	item = items[0]

	<self>
		css inset:10 d:hcs

		<button bind=item @click.select(items)> item
		<button bind=item @click.select(items)> item
		<button bind=item @click.select(items)> item

imba.mount <app>
