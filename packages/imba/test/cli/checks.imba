export default {
	"imba build app/simple.html": {
		"dist/simple.html": [
			/assets\/app\/shared\.\w{8}\.mjs/
			/assets\/json\/manifest\.\w{8}\.json/
			/assets\/all\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
		]
	}
	"imba build --base /imba app/simple.html": {
		"dist/simple.html": [
			/\/imba\/assets\/app\/shared\.\w{8}\.mjs/
			/\/imba\/assets\/json\/manifest\.\w{8}\.json/
			/\/imba\/assets\/all\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
		]
	}
	
	"imba build app/multi.html": {
		"dist/multi.html": [
			/assets\/app\/home\.\w{8}\.mjs/
			/assets\/app\/about\.\w{8}\.mjs/
			/assets\/all\.\w{8}\.css/
		]
		"*?css": [
			/--shared: 1/
			/--home: 1/
			/--about: 1/
		]
	}
}