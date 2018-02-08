extern describe, test, ok

def check find, &blk
	let val = String(blk)
	ok(val.indexOf(find) >= 0, "'{find}' not found in {val}")
	
describe 'Syntax - Tags' do
	
	var strvar = "hello"
	var numvar = 1
	var fnvar = do yes
	var objvar = {a: 1, b: 2}

	test 'id' do
		check "setId('one')" do <div#one>

	test 'flags' do
		check "flag('two')" do <div.two>
		check "flag('two',numvar)" do <div .two=numvar>
		check "setFlag(0,strvar)" do <div .{strvar}>
		check "setFlag(0,self.name())" do <div .{name}>
			
	# attributes
	test 'attributes' do
		check "setTitle(strvar)" do <div title=strvar>
		check "css('display','block')" do <div css:display='block'>
		check "setDisabled('disabled')" do <input disabled>
		check "setDisabled('disabled').setReadonly('readonly')" do <input disabled readonly>
		check "set('model',strvar,\{number:1\})" do <div model.number=strvar>
		
	# events
	test 'events' do
		check "('tap',['prevent','after'],0)" do <div.two :tap.prevent.after>
		check "('tap',[['incr',10]],0)" do <div.two :tap.incr(10)>
		check "('tap',[fnvar],0)" do <div.two :tap=fnvar>

	test 'data' do
		check "setData(objvar)" do <div[objvar]>
	
	test 'ref' do
		check "ref_('main',self)" do <div[objvar]@main>