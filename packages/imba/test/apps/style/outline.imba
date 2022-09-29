# SKIP

import './shared'

tag App
	<self>
		css div bg:blue5 rd:md c:red4 hue:blue @hover:cyan
			@hover d:block c:blue4 hue:green
			d@active:hflex
			eod:10px
		# <styled> <div[ol:1px solid red5]>
		# <styled> <div[ol:1px olo:4px]>
		# <styled> <div[ol:red6 @hover:3px]>
		# <styled> <div[ol@hover:green6 olw:1px olo:4px @hover:4px ease:1s rd@hover:2px]>
		# <styled> <div[rd:full olo:8px olc:hue5]>
		# <styled> <div[rd:full olo@hover:8px olc@hover:hue5 ease:300ms olw:0px @hover:3px]>
		# <styled> <div[ol:purple5]>

imba.mount(<App>)
