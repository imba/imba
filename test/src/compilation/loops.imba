
def update
	var a = (b + 10)
	(x * 200)
	(x * 200,10)
	@updates++
	if @gestures
		(g.ontouchupdate(self) for g in @gestures)
		var a = b((g.ontouchupdate(self) for g in @gestures))
	target.ontouchupdate(self) if target and target:ontouchupdate
	self
