tag ui-circle

	percent = 100
	radius = 10
	width = 2
	stroke = 'white'
	stroke2 = 'grey'
	fill='none'

	get circumference
		radius * 2 * Math.PI

	get dashoffset
		circumference - percent / 100 * circumference

	<self>
		css pos:rel

		<svg width="{radius*2 + width}px" height="{radius*2 + width}px">

			<circle
				r=radius
				stroke-width=width
				cx=(radius + width/2)
				cy=(radius + width/2)
				stroke=stroke2
				fill=fill
			>

			<circle
				r=radius
				stroke-width=width
				cx=(radius + width/2)
				cy=(radius + width/2)
				stroke=stroke
				stroke-dashoffset=dashoffset
				stroke-dasharray="{circumference} {circumference}"
				fill=fill
			>
				css e:350ms
					transform:rotate(-90deg)
					transform-origin:50% 50%

		<%slot>
			css pos:abs t:50% l:50% transform:translate(-50%,-50%)

			<slot>
