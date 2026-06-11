global css
	@focus outline:none
	html,body m:0 min-height:100vh

	body
		d:grid gaf:row ac:center jc:stretch ji:center gap:2 p:2

	main,div,section,form,article,header,footer
		pos:relative

	body > main
		d:grid gaf:row ac:start gap:2 p:2
		pos:absolute inset:0

	div
		gaf:column ja:center

	section,form
		d:grid gaf:row ac:center jc:stretch ji:center gap:2

	header,footer
		d:flex fld:row gaf:column js:stretch jc:stretch ji:stretch gap:2

	article
		d:grid gaf:row ac:start gap:2 p:2
		rd:2
		border:1px dashed gray3
		min-height:60px

	figure
		d:grid gaf:row ja:center gap:2

	body > fieldset
		d:hflex flw:wrap ja:center
		> * m:1
		> h1,h2,h3,h4,h5,h6,p,legend w:100% fls:0 ta:center
		legend c:gray6 fs:sm



	group,cell,box
		d:grid pos:relative gtc:100% ai:center
		1cmx:0.5cg 1cmy:0.5rg
		> div
			all:unset pos:relative m:-1cmx -1cmy d:flex flw:wrap ai:inherit
			
		> div > * m:1cmy 1cmx

	flex
		pos:relative d:flex flw:wrap
		1cmx:0.5cg 1cmy:0.5rg
		m:-1cmx -1cmy
		> * m:1cmy 1cmx

	.group, .bar
		pos:relative d:flex flw:wrap fld:row
		1cmx:0.5cg 1cmy:0.5rg
		m.group:-1cmx -1cmy
		> * m:1cmy 1cmx

	li
		p:1
		bbw:1 bbc:gray3

	label
		fw:400 c:gray6 fs:sm ta:center

	a td:u c:blue6

	mark
		d:grid gaf:column ja:center gap:2
		bw:1 bc:yellow4 rd:1 py:1 px:2 fs:smaller
		bg:yellow3 c:yellow8

	button
		d:grid gaf:column ja:center gap:2
		py:1 px:3 fw:400 min-width:6 min-height:8
		bw:1px bc:gray4 rd:2
		fs:md/1.2
		c:gray7 @hover:gray8
		bg:gray1 @hover:gray2 @active:gray3
		bxs:xs
		us:none
		tween:100ms ease-in-out
		y@active:1px
		@focus outline:none bxs:0 0 0 3px blue3/35 bc:blue4
		@disabled c:gray5
		# @is-busy c:gray5 opacity:0.7 scale:0.96 pe:none outline:none

	.chip
		px:2 py:1 fs:sm

	.pill rd:2 bg:teal2 fs:xs c:teal7 py:1 px:2
	
	.clickable
		inset:0 bg:gray1 p:2 of:hidden d:hflex ja:center
		@before content: "click anywhere" c:gray3 fs:xl fw:500

	.rect
		cursor:pointer
		fs:sm c:black/70
		touch-action:none
		d:flex jc:center ai:center rd:sm min-width:8 min-height:8 ta:center

	.box
		cursor:pointer
		fs:sm c:black/70
		touch-action:none
		d:flex jc:center ai:center rd:sm min-width:8 min-height:8 ta:center
		bg:purple3/60 @hover:purple3/90
		
	.alert
		bd:blue6 bg:blue5 d:hflex ja:center c:white rd:sm p:2 px:3 pos:absolute inset:24px

	.tags
		m: -4px
		> m:4px

	.handle
		pos:absolute fs:sm w:1em h:1em mt:-0.5em ml:-0.5em bg:purple6 rd:xs
		top:0 left:0 

	.panel
		d:flex fld:column flex:1
		header,footer flex:0
		section,main flex:1

	.frame
		pos:absolute inset:10 bd:1px dashed gray4 bg:gray1 rd:md d:flex ja:center

	samp,var
		d:grid ja:center min-width:60px p:1
		bs:dashed bw:1 bc:gray4 rd:2

	select,textarea,input
		py:1 px:3 min-width:10 min-height:8
		bw:1 rd:2
		fs:md/1.2
		c:gray8 @hover:gray9
		bc:gray3 @hover:gray4/80
		bg:white @focus:white
		@focus bxs:0 0 0 3px blue3/35 bc:blue4
		@disabled c:gray5

	input[type=range],input[type=checkbox],input[type=radio]
		p:0 bw:0 bxs:none min-width:initial

	input[type=number] w:60px pr:0

	input@not([type]),input[type=text]
		min-width:20
		flex:1

	input.inline
		bw:0 bg:clear p:0 m:0

	select
		w:160px flex:1

	.faded o:0.5
	.busy c:gray5 opacity:0.7 scale:0.96 pe:none outline:none

	input[type=range]
		-webkit-appearance: none min-height:initial

	input[type=range]::-webkit-slider-runnable-track
		w:100% h:8px bg:gray2 rd:2 border:1px solid gray4 box-sizing:border-box
	input[type=range]::-webkit-slider-thumb
		-webkit-appearance: none 
		w:14px h:14px mt:-4px bg:blue5 rd:10 box-sizing:border-box

	input[type=checkbox]
		min-height:initial

	input[type=radio]
		min-height:initial

	#hud
		pos:absolute t:0 l:0 r:0 p:3 bg:gray1 border-bottom:1px solid gray3
		h:8 fs:sm c:gray5
		input[type=range] w:60px
		.num d:block w:6

	#hud + main t:8

global css .clocks
	d:grid gtc: 1fr 1fr 1fr 1fr p:4 gap:4

	.clock
		pos:relative w:100% py:50% rd:2 bg:gray3
		@after content: attr(title) w:100% ta:center b:0 pos:absolute d:block

	.dial
		transform-origin: 50% 100% rd:1
		pos:absolute b:50% l:50% x:-50%
		bg:gray8 .m:gray7 .s:red
		h:30% .m:42% .s:45%
		w:5px .m:4px .s:3px
		i,b pos:absolute d:block t:100% bg:inherit l:50% x:-50%
		i h:10px ..s:20px w:75% o:0.7
		b size:10px rd:100 y:-50%

global css .app
	d:vflex pos:absolute inset:0 p:2
	> nav d:hflex ja:center p:1 bdb:1px solid gray3
		a mx:1
	> main fl:1 d:vflex ja:center
	.page  fl:1 d:hflex ja:center
	a.active td:none c:gray8
	aside fl:0 0 120px d:vflex j:flex-start px:2 bdr:gray3 fs:sm
	main d:hflex ac:stretch  p:2
	section fl:1

global css .colors
	div m:1 w:16 h:8 rd:md d:flex ja:center

global css .striped
	background-size: auto auto
	background-color: rgba(255, 255, 255, 1)
	# background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 6px )
	background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, currentColor 3px, currentColor 4px )

global css .inline-demo
	d:hflex pos:absolute inset:0 ja:center
	div d:flex # ja:center

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
		.layout-box g:1px p:1 rd:2px size:180px bd:1px dashed cooler4/50 bg:cooler7/10
		# > div g:1 p:1 rd:2px size:180px bd:1px dashed cooler4/50 bg:cooler7/10
		.child rd:3px min-width:20px min-height:20px bg:teal4 w:20px

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

global css .modal-wrapper pos:absolute t:0 l:0 w:100% h:100% d:flex jc:center ai:center bg:gray3
	main bg:white w:80% h:10rem p:6 d:flex jc:center ai:center rd:xl