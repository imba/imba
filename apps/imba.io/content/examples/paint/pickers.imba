tag value-picker
	css w:100px h:40px pos:rel
		d:hgrid ji:center ai:center
	css .item h:100% pos:rel tween:styles 0.1s ease-out

	def update e
		data = options[e.x]

	<self @touch.stop.fit(0,options.length - 1,1)=update>
		for item in options
			<div.item[$value:{item}] .sel=(item==data)>

tag stroke-picker < value-picker
	css .item bg:black w:calc($value*1px) h:40% rd:sm
		o:0.3 @hover:0.8 .sel:1

tag color-picker < value-picker
	css .item js:stretch rdt:lg bg:$value mx:2px scale-y.sel:1.5