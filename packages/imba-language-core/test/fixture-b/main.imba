# same export name as fixture/main.imba, different signature — the old
# plugin's last-project-wins bug would leak one project into the other
export def greet count\number
	count * 2

export tag b-widget
	<self> "b"
