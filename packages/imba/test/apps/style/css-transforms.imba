# Transform shorthands. x/y/rotate/scale compose through --t_* variables;
# z, skew-x and skew-y switch the element over to the 3d transform rule.

def cs el
	window.getComputedStyle(el)

def matrix el
	new DOMMatrix(cs(el).transform)

def close a, b, message = ''
	assert Math.abs(a - b) < 0.001, "expected {b} but got {a} {message}"

def tan deg
	Math.tan(deg * Math.PI / 180)

tag App
	<self>
		<div$xy[x:10px y:20px]>
		<div$pct[w:100px h:40px x:50% y:-50%]>
		<div$rot[rotate:90deg]>
		<div$turn[rotate:0.25turn]>
		<div$scale[scale:2]>
		<div$scalexy[scale-x:2 scale-y:0.5]>
		<div$combo[x:10px scale:2]>
		<div$origin[rotate:45deg origin:top left]>
		<div$z[z:10px]>
		<div$zxy[x:5px y:6px z:7px]>
		<div$skewx[skew-x:10deg]>
		<div$skewy[skew-y:20deg]>
		<div$skewboth[skew-x:10deg skew-y:20deg]>
		<div$skewscale[skew-x:45deg scale-x:2]>
		<div$flagged.on[x:0 .on:12px]>
		<div$flagz.on[x:3px z.on:4px]>
		<div$none>

describe '2d transforms' do
	let el = imba.mount <App>

	test 'x and y' do
		let m = matrix(el.$xy)
		eq m.e, 10
		eq m.f, 20
		assert m.is2D

	test 'percentages are relative to the element' do
		let m = matrix(el.$pct)
		eq m.e, 50
		eq m.f, -20

	test 'rotate with deg' do
		let m = matrix(el.$rot)
		close m.a, 0
		close m.b, 1

	test 'rotate with turn' do
		let m = matrix(el.$turn)
		close m.a, 0
		close m.b, 1

	test 'scale' do
		let m = matrix(el.$scale)
		eq m.a, 2
		eq m.d, 2

	test 'scale-x and scale-y' do
		let m = matrix(el.$scalexy)
		eq m.a, 2
		eq m.d, 0.5

	test 'translate is applied before scale' do
		let m = matrix(el.$combo)
		eq m.a, 2
		eq m.e, 10

	test 'transform-origin' do
		eq cs(el.$origin).transformOrigin, '0px 0px'

	test 'no transform without transform properties' do
		eq cs(el.$none).transform, 'none'

	test 'transforms with class modifiers' do
		eq matrix(el.$flagged).e, 12
		el.$flagged.classList.remove('on')
		eq matrix(el.$flagged).e, 0

describe '3d and skew transforms' do
	let el = imba.mount <App>

	test 'z produces a 3d matrix' do
		let m = matrix(el.$z)
		assert !m.is2D
		eq m.m43, 10

	test 'z with x and y' do
		let m = matrix(el.$zxy)
		eq m.m41, 5
		eq m.m42, 6
		eq m.m43, 7

	test 'skew-x' do
		let m = matrix(el.$skewx)
		close m.c, tan(10)
		close m.b, 0

	test 'skew-y' do
		let m = matrix(el.$skewy)
		close m.b, tan(20)
		close m.c, 0

	test 'skew-x and skew-y together' do
		let m = matrix(el.$skewboth)
		close m.a, 1 + tan(10) * tan(20)
		close m.b, tan(20)
		close m.c, tan(10)

	test 'skew combined with scale' do
		let m = matrix(el.$skewscale)
		close m.a, 2
		close m.c, 1

	test 'z from a class modifier' do
		let m = matrix(el.$flagz)
		eq m.m41, 3
		eq m.m43, 4
		el.$flagz.classList.remove('on')
		m = matrix(el.$flagz)
		eq m.e, 3
		assert m.is2D
