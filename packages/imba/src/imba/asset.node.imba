class Asset

	get url


	def toString
		url

export def asset data
	console.log "get asset!",data

	if data.#asset
		return data.#asset

	# if data.type == 'svg'
	# 	return data.#asset ||= new SVGAsset(data)
	
	if data.input
		let extra = globalThis._MF_ and globalThis._MF_[data.input]
		if extra
			Object.assign(data,extra)
			data.toString = do this.absPath
			# data.#asset = data
		return data.#asset ||= AssetProxy.wrap(data)
	
	return data