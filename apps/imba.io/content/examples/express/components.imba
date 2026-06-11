import store from './store'

tag story-item < li
	<self[d:block py:2 px:4] @intersect.silent.in=data.load!>
		<div>
			<span[fs:sm/1.2 c:gray9]> data.title or "-"
			<span[ml:1 prefix:"(" suffix:")" d@empty:none]>
				if data.url then <a href=data.url.href> data.url.hostname
		<div> "{data.score} points by {data.by}"

tag story-list
	def routed {category},state
		let url = `{category}stories`
		data = state.data ||= await store.fetch(url)
		data.preload(0,15)
		window.scrollTo(0,0)

	<self[d:block o@suspended:0.4]>
		<ul> for item in data
			<story-item data=item>