extern eq

tag custom

	def hello
		true




describe 'Tags - Define' do

	test "basic" do
		var el = <custom>
		eq el.hello, true
		eq el.toString, "<div class='_custom'></div>"
