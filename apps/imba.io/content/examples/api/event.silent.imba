# [preview=md]
import 'util/styles'

# ---
let counter = 0

imba.mount do <section>
	<div.group>
		<button @click.silent=(do yes)> "Silenced"
		<button @click=(do yes)> "Not silenced"
	<label> "Rendered {++counter} times"