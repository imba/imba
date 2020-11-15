class Rect
	let center = 100
		get 
			let centerX = origin.x + (size.width / 2)
            let centerY = origin.y + (size.height / 2)
            return Point(x: centerX, y: centerY)

		set
			origin.x = newValue.x - (size.width / 2)
            origin.y = newValue.y - (size.height / 2)

		will-set
			...
		did-set
			...

class Rect
	prop center = 100

	get center
		let centerX = origin.x + (size.width / 2)
		let centerY = origin.y + (size.height / 2)
		return Point(x: centerX, y: centerY)

	set center
		origin.x = newValue.x - (size.width / 2)
		origin.y = newValue.y - (size.height / 2)

	will-set
		...
	did-set
		...
	