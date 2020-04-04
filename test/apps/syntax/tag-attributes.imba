tag app-item
	attr ref-name

test 'attributes' do
	let el = <app-item ref-name='one'>
	ok el.getAttribute('ref-name') == 'one'
