# <div[x:{a}px]>

test do
	let num = 10
	# let b = 20 -10px
	
	+ 10px

	let pos = 10px
	eq pos, '10px'
	
	let neg = -10px
	eq neg, '-10px'

	eq (-num)px,'-10px'
	
	eq 10%,'10%'
	eq (num)%,'10%'
	
	