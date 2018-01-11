extern describe, test, ok, eq, it

describe "Tags" do

	describe "escaping" do

		test "attr script" do
			var title = "<script>true</script>"
			var el = <div title=title>
			eq el.toString, '<div title="<script>true</script>"></div>'
		
		test "attr quote" do
			var title = "Hello \""
			var el = <div title=title>
			eq el.toString, '<div title="Hello &quot;"></div>'
			
		test "textContent" do
			var title = "Hello \"<script>true</script>"
			var el = <div> "Hello \"<script>true</script>"
			eq el.toString, '<div>Hello &quot;&lt;script&gt;true&lt;/script&gt;</div>'
			
			var el = <div> title
			eq el.toString, '<div>Hello &quot;&lt;script&gt;true&lt;/script&gt;</div>'

		
		test "dont escape in script" do
			var script = 'console.log("hello")'
			var el = <script> 'console.log("hello")'
			eq el.toString, '<script>console.log("hello")</script>'
