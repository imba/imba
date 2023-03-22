import { ViteNodeRunner } from "__VITE_NODE_CLIENT__"

function handleError(msg, error) {
	console.error(msg, error)
	process.send("exit")
}
const runner = new ViteNodeRunner({
	root: ["__ROOT__"],
	base: ["__BASE__"],
	// debug: true,
	fetchModule: async function (id) {
		return new Promise((resolve) => {
			try {
				process.once('message', (msg) => {
					const message = JSON.parse(msg)
					if (message.type == "fetched" && id == message.id){
						resolve(message.md)
					}
				})
				process.send({ type: 'fetch', id })
			} catch (error) {
				handleError(`Error fetching module ${id}`, error)
			}
		})

	},
	resolveId: async function (id, importer) {
		return new Promise((resolve) => {
			try {
				process.once('message', msg => {
					const { input, output, type } = JSON.parse(msg)
					if (type === "resolved") {
						if (input.id == id && input.importer == importer)
							resolve(output)
					}
				})
				process.send({ type: 'resolve', payload: { id, importer } })
			} catch (error) {
				handleError(`Error resolving module with id ${id}`, error)
			}
		})
	}
}
);
const file = '__FILE__'
await runner.executeFile(file).catch(function (error) {
	handleError(`Error executing file ${file}`, error)
});
