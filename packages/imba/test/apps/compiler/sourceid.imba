let fs = {}

import * as imbac from 'imba/compiler'

test 'sourceid' do
	let res = imbac.compile('<div[h:1px]>',sourceId: 'AA')
	ok res.css.match(/\.AA/)
