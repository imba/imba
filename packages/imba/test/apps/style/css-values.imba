# String, url() and raw values in style blocks, auto-prefixed properties,
# empty style blocks and selectors containing brackets, quotes and comments.

def cs el, pseudo = null
	window.getComputedStyle(el,pseudo)

const GIF = "data:image/gif;base64,R0lGODlhAQABAAAAACw="

tag Strings
	css .empty @before content:"" d:block
	css .single @after content:'x'
	css .running @before content: "> running..."
	css .spaced @before content:" " d:block
	css .escaped @before content:"\"quoted\""
	css .pre prefix:"pre " suffix:' post'
	css .areas d:grid gta:"a b" "c d"
	css .named ff:"Roboto Condensed", sans-serif
	css .quoted ff:"Comic Sans", cursive
	css .counted counter-reset:section 2
		@before content:counter(section) " items"

	<self>
		<div$empty.empty>
		<div$single.single>
		<div$running.running>
		<div$spaced.spaced>
		<div$escaped.escaped>
		<div$pre.pre> "text"
		<div$areas.areas>
		<div$named.named>
		<div$quoted.quoted>
		<div$counted.counted>

tag Urls
	css .plain bg:url(assets/noise.png) repeat
	css .image bgi:url(assets/noise.png) o:0.2
	css .single mask:url('assets/sparkle-single.svg') no-repeat center center
	css .double bgi:url("assets/double.png")
	css .data bgi:url(data:image/gif;base64,R0lGODlhAQABAAAAACw=)
	css .multi bgi:url(a.png), url(b.png)

	<self>
		<div$plain.plain>
		<div$image.image>
		<div$single.single>
		<div$double.double>
		<div$data.data>
		<div$multi.multi>

tag Raw
	<self>
		<svg$svg width=20 height=20>
			<circle$circle cx=10 cy=10 [raw-r:5px fill:red]>
			<circle$circle2 cx=10 cy=10 [raw-r:(0.5px * 4 + 1px)]>
		<div$right[pos:relative raw-r:5px r:10px]>
		<div$rawprop[raw-width:30px raw-height:12px]>

tag Prefixed
	<self>
		<div$us[us:none]>
		<div$appearance[appearance:none]>
		<input$input[appearance:none]>
		<div$backdrop[backdrop-filter:blur(3px)]>
		<div$mask[mask-image:linear-gradient(black,transparent)]>

tag Blocks
	css
		.unstyled
			# nothing here yet
		.styled fw:700
		.later
			# only a comment
			# and another
		.last fw:300

	<self>
		<div$unstyled.unstyled>
		<div$styled.styled>
		<div$later.later>
		<div$last.last>

tag Selectors
	css [role=listitem] .label fw:700
	css &[aria-current=page] fw:600
	css button[aria-label="Toggle Sidebar"] fw:800
	css div[title='a b'] fw:500
	css .fab # floating action button
		fw:900
	css .grp@is(.x,.y) fw:200
	css .grp@not(.x,.y) fw:250
	css .has@has(> .inner) fw:300

	<self aria-current='page'>
		<div role='listitem'> <span$label.label>
		<button$btn aria-label="Toggle Sidebar">
		<div$titled title='a b'>
		<div$fab.fab>
		<div$isx.grp.x>
		<div$isz.grp.z>
		<div$has.has> <span.inner>

describe 'strings' do
	let el = imba.mount <Strings>

	test 'empty content' do
		eq cs(el.$empty,'::before').content, '""'
		eq cs(el.$empty,'::before').display, 'block'

	test 'single quoted content' do
		eq cs(el.$single,'::after').content, '"x"'

	test 'content with leading operator characters' do
		eq cs(el.$running,'::before').content, '"> running..."'

	test 'whitespace content' do
		eq cs(el.$spaced,'::before').content, '" "'

	test 'escaped quotes' do
		eq cs(el.$escaped,'::before').content, '"\\"quoted\\""'

	test 'prefix and suffix' do
		eq cs(el.$pre,'::before').content, '"pre "'
		eq cs(el.$pre,'::after').content, '" post"'

	test 'grid-template-areas strings' do
		eq cs(el.$areas).gridTemplateAreas, '"a b" "c d"'

	test 'quoted font family with fallback' do
		eq cs(el.$named).fontFamily, '"Roboto Condensed", sans-serif'
		eq cs(el.$quoted).fontFamily, '"Comic Sans", cursive'

	test 'string after a function' do
		eq cs(el.$counted,'::before').content, 'counter(section) " items"'

describe 'url()' do
	let el = imba.mount <Urls>

	test 'unquoted url in background shorthand' do
		assert cs(el.$plain).backgroundImage.match(/^url\(".*\/assets\/noise\.png"\)$/) != null
		eq cs(el.$plain).backgroundRepeat, 'repeat'

	test 'unquoted url in background-image' do
		assert cs(el.$image).backgroundImage.match(/^url\(".*\/assets\/noise\.png"\)$/) != null
		eq cs(el.$image).opacity, '0.2'

	test 'single quoted url' do
		assert cs(el.$single).maskImage.match(/sparkle-single\.svg/) != null
		eq cs(el.$single).maskRepeat, 'no-repeat'

	test 'double quoted url' do
		assert cs(el.$double).backgroundImage.match(/\/assets\/double\.png"\)$/) != null

	test 'data uri' do
		eq cs(el.$data).backgroundImage, "url(\"{GIF}\")"

	test 'comma separated urls' do
		let val = cs(el.$multi).backgroundImage
		assert val.match(/^url\(".*\/a\.png"\), url\(".*\/b\.png"\)$/) != null

describe 'raw properties' do
	let el = imba.mount <Raw>

	test 'raw-r sets the svg r property' do
		eq cs(el.$circle).r, '5px'

	test 'raw-r with math' do
		eq cs(el.$circle2).r, '3px'

	test 'raw-r does not expand to right' do
		eq cs(el.$right).right, '10px'

	test 'raw props are emitted verbatim' do
		eq cs(el.$rawprop).width, '30px'
		eq cs(el.$rawprop).height, '12px'

describe 'auto-prefixed properties' do
	let el = imba.mount <Prefixed>

	test 'user-select' do
		eq cs(el.$us).userSelect, 'none'
		eq cs(el.$us).webkitUserSelect, 'none'

	test 'appearance' do
		eq cs(el.$input).appearance, 'none'
		eq cs(el.$input).webkitAppearance, 'none'

	test 'backdrop-filter' do
		eq cs(el.$backdrop).backdropFilter, 'blur(3px)'

	test 'mask-image' do
		eq cs(el.$mask).maskImage, 'linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0))'
		eq cs(el.$mask).webkitMaskImage, 'linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0))'

describe 'empty style blocks' do
	let el = imba.mount <Blocks>

	test 'comment-only block is ignored' do
		eq cs(el.$unstyled).fontWeight, '400'
		eq cs(el.$later).fontWeight, '400'

	test 'rules after an empty block still apply' do
		eq cs(el.$styled).fontWeight, '700'
		eq cs(el.$last).fontWeight, '300'

describe 'selectors with brackets and comments' do
	let el = imba.mount <Selectors>

	test 'attribute selector before descendant' do
		eq cs(el.$label).fontWeight, '700'

	test 'attribute selector on self' do
		eq cs(el).fontWeight, '600'

	test 'quoted attribute value with spaces' do
		eq cs(el.$btn).fontWeight, '800'
		eq cs(el.$titled).fontWeight, '500'

	test 'inline comment after selector' do
		eq cs(el.$fab).fontWeight, '900'

	test 'selector functions with commas' do
		eq cs(el.$isx).fontWeight, '200'
		eq cs(el.$isz).fontWeight, '250'

	test ':has with child combinator' do
		eq cs(el.$has).fontWeight, '300'
