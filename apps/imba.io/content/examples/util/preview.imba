global css
	@focus outline:none
	html,body m:0 min-height:100vh
	body d:grid gaf:row ac:center jc:stretch ji:center gap:2 p:0

global css .striped
	background-size: auto auto
	background-color: rgba(255, 255, 255, 1)
	# background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px )
	background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 4px )

global css .inline-demo
	d:hflex pos:absolute inset:0 ja:center
	div d:flex ja:center

	.filled
		pos:absolute inset:0 d:flex ja:center rd:sm
		transition:all 0.1s ease-in-out

	.target
		d:flex ja:center
		transition:all 0.1s ease-in-out

	.dashed
		pos:absolute inset:4 d:flex ja:center rd:0
		bd:1px dashed white bgc:white/25

	.border-radius
		pos:absolute inset:4 d:flex ja:center rd:0
		bgc:white/25

	.base bgc:yellow2 size:80px

	&.layouts
		main g:1px p:1 rd:2px size:180px bd:1px dashed cooler6/50 bg:cooler7/0
		# > div g:1 p:1 rd:2px size:180px bd:1px dashed cooler4/50 bg:cooler7/10
		section rd:3px min-width:20px min-height:20px bg:teal4

	&.typography
		c:white fs:xl

	&.transforms
		c:white fs:xl
		.target transition:all 0.25s ease-out
		.base bgc:yellow2 size:80px rd:sm
		.base > div pos:absolute inset:0 bgc:blue3/90 rd:sm

	&.sizes
		c:white
		.base bgc:white size:80px
		.base > div pos:absolute inset:0 bgc:blue3

	&.margins
		c:white
		.base > div.target pos:absolute inset:0 bgc:white rd:sm

	&.positions
		c:white
		.base bgc:yellow2 size:80px pos:relative
		.base > div size:40px bgc:blue2 t:0 l:0
	
	&.positioning
		c:white
		.base bgc:yellow2 size:80px pos:relative
		.base > div size:40px bgc:blue2 pos:absolute
	
	&.paddings
		c:white
		.target
			size:100px
			bgi:url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAH0lEQVQYV2NkQAUzGZH4MxkYGNJhAmAOSBIkAOeABABpLgOeuZzTDQAAAABJRU5ErkJggg==')
			d:flex
			bgc:gray1
			rd:sm
			@after
				content:" "
				d:block
				as:stretch
				fl:1
				bgc:white
				o:0.8
				rd:xs
		.base > div.target pos:absolute inset:0 bgc:white rd:sm