import {movies} from 'imdb'

tag App
	query

	def match movie
		!query or movie.title.toLowerCase!.indexOf(query) >= 0

	def render
		<self[d:block p:5]>
			<input[p:2 d:block w:100%] bind=query placeholder="Search">
			<ul> for movie in movies
				continue if !match(movie)
				<li[p:2 bbw:1 bbc:gray3]> movie.title

imba.mount <App>