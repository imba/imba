import {Location} from './location'
# import Route from './route'

export class Request
	# prop router
	# prop referrer
	# prop aborted
	# prop location
	# prop state
	# prop mode

	def constructor router, loc, referrer
		router = router
		if loc
			location = Location.parse(loc)
			original = location.clone!

		referrer = referrer
		# @path = @originalPath = path
		# @referrer = referrer

	def redirect path
		location..update(path)
		# allow normalizing urls
		# @redirected = @path = path
		self
		
	get path
		location..path
		
	get url
		location..toString()
		
	set path value
		location.path = value

	def abort forced = no
		aborted = yes
		forceAbort = forced if forced
		self

	def match str
		location ? (new Route(self,str)).test() : null