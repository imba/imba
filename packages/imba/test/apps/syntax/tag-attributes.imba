tag app-item
	attr ref-name

let str = 'one'

test 'attributes' do
	let el = <app-item ref-name='one'>
	ok el.getAttribute('ref-name') == 'one'


test 'global attributes' do
	let el = <div itemprop=str unknownprop=str>
	eq el.getAttribute('itemprop'), str
	eq el.hasAttribute('unknownprop'), false
	
test 'raw setAttribute' do
	let el = <div html:unknownprop=str>
	eq el.getAttribute('unknownprop'), str

test 'override attribute' do
	# now extend div
	extend tag div
		set itemprop val
			setAttribute('other',val)
	
	let el2 = <div itemprop=str>
	eq el2.hasAttribute('itemprop'), false
	eq el2.getAttribute('other'), str

test 'tag id' do
	let el = <div#one>
	eq el.id, 'one'