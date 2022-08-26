export default {
	"imba build app/simple.html": {
		"dist/simple.html": [
			/assets\/shared\.\w{8}\.js/
			/assets\/manifest\.\w{8}\.json/
			/assets\/index\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
		]
	}
	"imba build --base /imba app/simple.html": {
		"dist/simple.html": [
			/\/imba\/assets\/shared\.\w{8}\.js/
			/\/imba\/assets\/manifest\.\w{8}\.json/
			/\/imba\/assets\/index\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
		]
	}
	
	"imba build app/multi.html": {
		"dist/multi.html": [
			/assets\/home\.\w{8}\.js/
			/assets\/about\.\w{8}\.js/
			/assets\/index\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
			/--home: 1/
			/--about: 1/
		]
	}
}