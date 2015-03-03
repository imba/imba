

var a = await b

def update
	@updates++
	(g.ontouchupdate(self) for g in @gestures) if @gestures
	target.ontouchupdate(self) if target and target:ontouchupdate
	self