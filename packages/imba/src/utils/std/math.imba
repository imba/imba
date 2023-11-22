# imba$stdlib=1
Math.rand-int = do(min, max)
	# inclusive of min and max
	min = Math.ceil(min)
	max = Math.floor(max)
	Math.floor(Math.random! * (max - min + 1) + min)

Math.rand-float = do(min, max)
	# inclusive of min
	# exclusive of max
	Math.random! * (max - min) + min

Math.rand-bool = do Math.random! < 0.5
