# to run these tests, simply open the imbadir/test/dom.html in your browser and
# open the console / developer tools.

extern describe, test, ok, eq, it

# Count MountableTag instances
var totalMountables = 0
var totalMounted = 0

tag MultiLevelMountableTag

	def setup
		totalMountables++

	def mount
		totalMounted++
	
tag MountableTag
	
	def setup
		totalMountables++
		@showSecondLevel = false

	def mount
		totalMounted++
		schedule(raf: true)
	
	def tick
		@showSecondLevel = true
		super
	
	def render
		<self>
			<MultiLevelMountableTag>
			if @showSecondLevel
				<MultiLevelMountableTag>
				<div><div><div><div><div>
					<MultiLevelMountableTag>

tag MountableContainer

	def setup
		@mountableTagsCount = 1 
		# Can be any number doesn't really matter but make sure to update 
		# sleep time in test to give imba ample time to try mounting all 
		# the tags if the number is very large

	def mount
		schedule( raf: true )

	def render
		<self>
			for _ in Array.new @mountableTagsCount
				<MountableTag>

def sleep ms: 0
	Promise.new do |resolve|
		setTimeout(&, ms) do
			resolve()

describe "Tags - Mount" do

	test "mounting" do
		var item = <MountableContainer>
		Imba.mount item
		await sleep 100
		eq totalMounted, totalMountables

