import '.'

global css body bg:gray9

tag app

	items = ["hello", "world", "hi"]
	item = items[0]

	<self>
		css inset:10 d:hcc g:10 us:none
			%button cursor:default e:500ms tt:capitalize
				bg:emerald4 p:2 4 rd:2 c:gray9 fs:20px
				@hover bg:emerald2

		<%button bind=item @click.select(items)> item
		<%button bind=item @click.select(items)> item
		<%button bind=item @click.select(items)> item

imba.mount <app>
