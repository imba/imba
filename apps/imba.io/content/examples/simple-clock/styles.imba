global css body bg:white

global css .grid
	d:grid gtc:1fr 1fr gap:4 pos:abs w:100% h:100% p:4

global css app-clock
	pos:rel w:100% h:100% rd:2 d:block
	.location fs:md fw:700 ta:center c:gray8/40 p:2
	.dial pos:abs b:50% l:50% x:-50% origin:50% 100% rd:1
	.hour bg:gray8 h:30% w:5px
	.minute bg:gray6 h:42% w:4px
	.second bg:red5 h:45% w:2px
	.circle pos:abs t:50% l:50% m:-5px size:10px bg:red5 rd:full