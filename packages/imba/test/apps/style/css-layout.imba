# Layout shorthands: the named display layouts (box, hbox, lbox, hgrid ...)
# and the generated direction/alignment combos (d:hcl, d:vts, d:hcc ...),
# plus grid shorthands (gtc/gtr numbers, gt, w:2c / h:2r spans).

def cs el
	window.getComputedStyle(el)

def flex fld, jc, ai, ac = ai
	{display: 'flex', flexDirection: fld, justifyContent: jc, alignItems: ai, alignContent: ac}

tag Named
	<self>
		<div$box[d:box] eq={display: 'flex', justifyContent: 'center', alignItems: 'center'}> 'box'
		<div$hbox[d:hbox] eq=flex('row','center','center','normal')> 'hbox'
		<div$vbox[d:vbox] eq=flex('column','center','center','normal')> 'vbox'
		<div$lbox[d:lbox] eq=flex('row','flex-start','center','normal')> 'lbox'
		<div$rbox[d:rbox] eq=flex('row','flex-end','center','normal')> 'rbox'
		<div$tbox[d:tbox] eq=flex('column','flex-start','center','normal')> 'tbox'
		<div$bbox[d:bbox] eq=flex('column','flex-end','center','normal')> 'bbox'
		<div$hflex[d:hflex] eq={display: 'flex', flexDirection: 'row'}> 'hflex'
		<div$vflex[d:vflex] eq={display: 'flex', flexDirection: 'column'}> 'vflex'
		<div$hgrid[d:hgrid] eq={display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '1fr'}> 'hgrid'
		<div$vgrid[d:vgrid] eq={display: 'grid', gridAutoFlow: 'row'}> 'vgrid'

tag Horizontal
	# h + vertical(t/c/b/s) + horizontal(l/c/r/s)
	# horizontal letter -> justify-content, vertical letter -> align-items
	<self>
		<div[d:htl] eq=flex('row','flex-start','flex-start')> 'htl'
		<div[d:htc] eq=flex('row','center','flex-start')> 'htc'
		<div[d:htr] eq=flex('row','flex-end','flex-start')> 'htr'
		<div[d:hts] eq=flex('row','space-between','flex-start')> 'hts'
		<div[d:hcl] eq=flex('row','flex-start','center')> 'hcl'
		<div[d:hcc] eq=flex('row','center','center')> 'hcc'
		<div[d:hcr] eq=flex('row','flex-end','center')> 'hcr'
		<div[d:hcs] eq=flex('row','space-between','center')> 'hcs'
		<div[d:hbl] eq=flex('row','flex-start','flex-end')> 'hbl'
		<div[d:hbc] eq=flex('row','center','flex-end')> 'hbc'
		<div[d:hbr] eq=flex('row','flex-end','flex-end')> 'hbr'
		<div[d:hbs] eq=flex('row','space-between','flex-end')> 'hbs'
		<div[d:hsl] eq=flex('row','flex-start','stretch')> 'hsl'
		<div[d:hsc] eq=flex('row','center','stretch')> 'hsc'
		<div[d:hsr] eq=flex('row','flex-end','stretch')> 'hsr'
		<div[d:hss] eq=flex('row','space-between','stretch')> 'hss'

tag Vertical
	# v + vertical(t/c/b/s) + horizontal(l/c/r/s)
	# vertical letter -> justify-content, horizontal letter -> align-items
	<self>
		<div[d:vtl] eq=flex('column','flex-start','flex-start')> 'vtl'
		<div[d:vtc] eq=flex('column','flex-start','center')> 'vtc'
		<div[d:vtr] eq=flex('column','flex-start','flex-end')> 'vtr'
		<div[d:vts] eq=flex('column','flex-start','stretch')> 'vts'
		<div[d:vcl] eq=flex('column','center','flex-start')> 'vcl'
		<div[d:vcc] eq=flex('column','center','center')> 'vcc'
		<div[d:vcr] eq=flex('column','center','flex-end')> 'vcr'
		<div[d:vcs] eq=flex('column','center','stretch')> 'vcs'
		<div[d:vbl] eq=flex('column','flex-end','flex-start')> 'vbl'
		<div[d:vbc] eq=flex('column','flex-end','center')> 'vbc'
		<div[d:vbr] eq=flex('column','flex-end','flex-end')> 'vbr'
		<div[d:vbs] eq=flex('column','flex-end','stretch')> 'vbs'
		<div[d:vsl] eq=flex('column','space-between','flex-start')> 'vsl'
		<div[d:vsc] eq=flex('column','space-between','center')> 'vsc'
		<div[d:vsr] eq=flex('column','space-between','flex-end')> 'vsr'
		<div[d:vss] eq=flex('column','space-between','stretch')> 'vss'

tag Modified
	css .tab d:none .active:vts .routed:hcc
	css .item d:block @hover:hcl
	<self>
		<div$plain.tab>
		<div$active.tab.active>
		<div$routed.tab.routed>
		<div$item.item>
		<div$combo[d:hcc fld:column]>
		<div$override[d:vtl jc:center]>

tag Grids
	<self>
		<div$cols[d:grid gtc:3 w:300px]>
		<div$rows[d:grid gtr:2 h:100px]>
		<div$mixed[d:grid gtc:2 100px w:300px]>
		<div$template[d:grid gt:2 / 3 w:300px h:100px]>
		<div$template2[d:grid gt:1fr 3fr / 2 w:300px h:100px]>
		<div$areas[d:grid gt:"a b" 20px "c d" 30px / 1fr 2fr w:300px]>
		<div$autofit[d:grid w:300px gtc:repeat(auto-fit,minmax(100px, 1fr))]>
			<div>
			<div>
			<div>
		<div$minmax[d:grid w:300px gtc:minmax(0,1fr) auto]>
		<div$hgrid[d:hgrid w:300px]>
			<div$hg1>
			<div$hg2>
			<div$hg3>
		<div$spans[d:grid gtc:4 gtr:4 w:400px h:400px]>
			<div$span2[w:2c h:2r]>
			<div$span3[w:3cols h:2rows]>
			<div$span1[w:1col h:1row]>
			<div$gspan[gc:span 2 gr:span 3]>
		<div$placed[d:grid gtc:4 gtr:4 w:400px h:400px]>
			<div$explicit[gcs:2 gce:4 grs:1 gre:3]>
			<div$named[ga:main]>
		<div$minmaxw[w:>120px h:<40px]>

def checkChildren el
	for child in el.children
		test(child.textContent) do
			eqcss child, child.eq

describe 'named layouts' do
	checkChildren imba.mount(<Named>)

describe 'horizontal combos' do
	checkChildren imba.mount(<Horizontal>)

describe 'vertical combos' do
	checkChildren imba.mount(<Vertical>)

describe 'layouts as modifier values' do
	let el = imba.mount <Modified>

	test 'base value' do
		eq cs(el.$plain).display, 'none'

	test 'class modifier switches to a vertical combo' do
		eqcss el.$active, flex('column','flex-start','stretch')

	test 'second class modifier switches to a horizontal combo' do
		eqcss el.$routed, flex('row','center','center')

	test 'hover modifier with a layout' do
		eq cs(el.$item).display, 'block'
		el.$item.classList.add('@hover')
		eqcss el.$item, flex('row','flex-start','center')
		el.$item.classList.remove('@hover')

	test 'later properties override the combo' do
		eq cs(el.$combo).flexDirection, 'column'
		eq cs(el.$combo).justifyContent, 'center'
		eq cs(el.$override).justifyContent, 'center'
		eq cs(el.$override).alignItems, 'flex-start'

describe 'grid templates' do
	let el = imba.mount <Grids>

	test 'gtc with a number repeats 1fr' do
		eq cs(el.$cols).gridTemplateColumns, '100px 100px 100px'

	test 'gtr with a number repeats 1fr' do
		eq cs(el.$rows).gridTemplateRows, '50px 50px'

	test 'number mixed with other tracks' do
		eq cs(el.$mixed).gridTemplateColumns, '100px 100px 100px'

	test 'gt with numbers on both sides' do
		eq cs(el.$template).gridTemplateRows, '50px 50px'
		eq cs(el.$template).gridTemplateColumns, '100px 100px 100px'

	test 'gt with tracks and a number' do
		eq cs(el.$template2).gridTemplateRows, '25px 75px'
		eq cs(el.$template2).gridTemplateColumns, '150px 150px'

	test 'gt with areas' do
		eq cs(el.$areas).gridTemplateAreas, '"a b" "c d"'
		eq cs(el.$areas).gridTemplateRows, '20px 30px'
		eq cs(el.$areas).gridTemplateColumns, '100px 200px'

	test 'repeat with minmax' do
		eq cs(el.$autofit).gridTemplateColumns, '100px 100px 100px'

	test 'minmax and auto' do
		eq cs(el.$minmax).gridTemplateColumns, '300px 0px'

	test 'hgrid places children in equal columns' do
		eq cs(el.$hgrid).gridAutoFlow, 'column'
		eq el.$hg1.offsetWidth, 100
		eq el.$hg2.offsetLeft - el.$hg1.offsetLeft, 100
		eq el.$hg3.offsetLeft - el.$hg1.offsetLeft, 200

describe 'grid spans' do
	let el = imba.mount <Grids>

	test 'w:2c and h:2r span columns and rows' do
		eq cs(el.$span2).gridColumnEnd, 'span 2'
		eq cs(el.$span2).gridRowEnd, 'span 2'
		eq el.$span2.offsetWidth, 200
		eq el.$span2.offsetHeight, 200

	test 'cols and rows units' do
		eq cs(el.$span3).gridColumnEnd, 'span 3'
		eq cs(el.$span3).gridRowEnd, 'span 2'

	test 'col and row units' do
		eq cs(el.$span1).gridColumnEnd, 'span 1'
		eq cs(el.$span1).gridRowEnd, 'span 1'

	test 'gc and gr with span' do
		eq cs(el.$gspan).gridColumnStart, 'span 2'
		eq cs(el.$gspan).gridRowStart, 'span 3'

	test 'explicit start and end' do
		eq cs(el.$explicit).gridColumnStart, '2'
		eq cs(el.$explicit).gridColumnEnd, '4'
		eq cs(el.$explicit).gridRowStart, '1'
		eq cs(el.$explicit).gridRowEnd, '3'
		eq el.$explicit.offsetWidth, 200
		eq el.$explicit.offsetHeight, 200

	test 'named grid area' do
		eq cs(el.$named).gridArea, 'main'

	test 'w:> and h:< become min-width and max-height' do
		eq cs(el.$minmaxw).minWidth, '120px'
		eq cs(el.$minmaxw).maxHeight, '40px'
