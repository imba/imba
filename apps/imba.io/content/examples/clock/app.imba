tag app-clock
	<self>
		css div pos:abs b:50% l:50% x:-50% origin:50% 100%
		let ts = Date.now! / 60000 + utc * 60
		<header[fs:xl fw:700 ta:center c:gray8/40 p:2]> name
		<div[rd:1 bg:gray8 h:13vmin w:5px rotate:{ts / 720}]>
		<div[rd:1 bg:gray6 h:18vmin w:4px rotate:{ts / 60}]>
		<div[rd:1 bg:red5 h:21vmin w:2px rotate:{ts % 1000}]>
		<div[rd:full bg:red5 size:10px y:50%]>

tag app
	<self[d:grid gtc:1fr 1fr gap:4 pos:abs w:100% h:100% p:4]>
		css app-clock pos:rel w:100% rd:2
		<app-clock[bg:pink2] name='New York' utc=-5>
		<app-clock[bg:purple2] name='San Fran' utc=-8>
		<app-clock[bg:indigo2] name='London' utc=0>
		<app-clock[bg:sky2] name='Tokyo' utc=9>

imba.mount <app autorender=1fps>