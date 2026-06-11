tag app-clock
	utc

	css pos:relative w:100% py:50% rd:2 bg:gray3

	css .dial
		transform-origin: 50% 100% rd:1
		pos:absolute b:50% l:50% x:-50%
		bg:gray8 .m:gray7 .s:red
		h:30% .m:42% .s:45%
		w:5px .m:4px .s:3px
		i,b pos:absolute d:block t:100% bg:inherit l:50% x:-50%
		i h:10px ..s:20px w:75% o:0.7
		b size:10px rd:100 y:-50%

	def mount
		$interval = setInterval(render.bind(self),1000)
	
	def unmount
		clearInterval($interval)
	
	def render
		let ts = Date.now! / 60000 + utc * 60
		<self>
			<div.dial.h[rotate:{ts / 720}]> <i>
			<div.dial.m[rotate:{ts / 60}]> <i>
			<div.dial.s[rotate:{ts}]> <i/> <b>

imba.mount do <div[d:grid gtc: 1fr 1fr p:4 gap:4]>
	<app-clock title='New York' utc=-5>
	<app-clock title='San Fran' utc=-8>
	<app-clock title='London' utc=0>
	<app-clock title='Tokyo' utc=9>