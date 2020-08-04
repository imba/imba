global css @keyframes blink
	100% o:0
	0% o:1

css @keyframes blink
	100% o:0
	0% o:1

global css .test
	@keyframes blink
		from o:0
		to o:1

	@keyframes plonk
		from c:blue3
		to c:red6

css @keyframes blank
	from o:0
	to o:1

css .test
	d:block
	@keyframes blink
		from o:0
		to o:1

	.item
		animation-name: blink

css .other
	@keyframes blink
		from o:0.2
		to o:0.6

css .animated
	d: block
	animation: blink 3s infinite
	animation: linear blink 3s infinite

css .eased
	animation: blink 3s quad-out infinite

	&.test
		animation-name: plonk,blink
		animation-timing-function: quad-out

imba.mount <div>
	<div.animated> "Animated"
	<div.other.animated> "Animated other"
	<div.eased> "Quad out"
	<div.eased.test> "Color?!"