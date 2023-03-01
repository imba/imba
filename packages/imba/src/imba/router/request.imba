import {Location} from './location'

export class Request
	def constructor router, loc, referrer, params
		params = params
		router = router
		if loc
			location = Location.parse(loc)
			original = location.clone!
		referrer = referrer

	get apply do params.apply or []
	get revert do params.revert or []
	get state do params.state
	get mode do params.mode

	def redirect path
		location..update(path)
		self

	get path
		location..path

	get url
		location..toString!

	set path value
		location.path = value

	def abort forced = no
		aborted = yes
		forceAbort = forced if forced
		self

	def match str
		location ? router.route(str).match(path) : null