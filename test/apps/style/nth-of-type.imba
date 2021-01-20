css div
	bg:red4
	@not(.test) bg:red3
	@nth-of-type(1) bg:blue3
	@nth-of-type(1n + 3) bg:blue3

tag Card
	<self[$tint:{} bg:gray3 d:vflex ja:center c:white rd:md o:$ratio]>
		<div[fs:xl c:gray8]> data.title
		<div[bg:{data.color} inset:0 o:calc(var(--ratio) * 0.3)]>