# to run these tests, simply open the imbadir/test/dom.html in your browser and
# open the console / developer tools.

extern describe, test, ok, eq, it

# Count MountableTag instances
var totalMountables = 0
var totalMounted = 0

tag UnMountableTag

tag MultiLevelMountableTag

	def setup
		totalMountables++

	def mount
		totalMounted++
	
	def unmount
		totalMounted--
	
tag MountableTag
	
	def setup
		totalMountables++
		@showSecondLevel = false

	def mount
		totalMounted++
		schedule(raf: true)
	
	def unmount
		totalMounted--
	
	def tick
		@showSecondLevel = true
		super
	
	def render
		<self>
			if @showSecondLevel
				<div><div><div><div><div>
					<MultiLevelMountableTag>
				<UnMountableTag>
					<MultiLevelMountableTag>

tag Container

	def setup
		@mountableTagsCount = 2
		# Can be any number doesn't really matter but make sure to update 
		# sleep time in test to give imba ample time to try mounting all 
		# the tags if the number is very large

	def render
		<self>
			for _ in Array.new @mountableTagsCount
				<UnMountableTag>
					<MountableTag>

def sleep ms: 0
	Promise.new do |resolve|
		setTimeout(&, ms) do
			resolve()

describe "Tags - Mount" do
	
	var item = <Container>

	test "mounting" do
		Imba.mount item
		await sleep 100
		eq totalMounted, totalMountables

	test "unmounting" do
		item.removeAllChildren
		Imba.TagManager.refresh
		eq totalMounted, 0
