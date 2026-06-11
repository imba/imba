tag MarkdownEditor
	value = 'Hello, **world**!'
	md = new global.Remarkable

	<self.MarkdownEditor>
		<h3> 'Input'
		<label for='content'> 'Enter some markdown'
		<textarea#content bind=value>
		<h3> 'Output'
		<div.content innerHTML=md.render(value)>

imba.mount <MarkdownEditor>