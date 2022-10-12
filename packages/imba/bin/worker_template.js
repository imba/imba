import { ViteNodeRunner } from "vite-node/client";
const runner = new ViteNodeRunner({
	root: ["__ROOT__"],
	base: ["__BASE__"],
	debug: true,
	fetchModule: async function (id) {

		if (id.endsWith("dist/imba.mjs")) { id = id.replace("dist/imba.mjs", "dist/imba.node.mjs") };
		return new Promise((resolve) => {
			try {
				console.log('child: before send', id)
				process.on('message', (msg) => {
					const message = JSON.parse(msg)
					// console.log('fetched', message)

					if (message.type == "fetched" && id == message.id)
						resolve(message.md)
				})
				process.send({ type: 'fetch', id })
				console.log('after send')
			} catch (error) {
				console.log('error in child', error)
			}
		})

	},
	resolveId: async function (id, importer) {
		console.log('resolveId', id, importer)
		return new Promise((resolve) => {
			console.log('resolveId: before send', id, importer)
			process.on('message', msg => {
				console.log("message resolved")
				const { input, output, type } = JSON.parse(msg)
				if (type === "resolved") {
					if (input.id == id && input.importer == importer)
						resolve(output)
				}
			})
			process.send({ type: 'resolve', payload: { id, importer } })
		})
	}
}
);
const run = async () => {
	console.log('executing vite env')
	// await runner.executeId('/@vite/env');
	console.log('executing file')
	const file = '__FILE__'
	// console.log("f", file)
	await runner.executeFile(file).catch(function (_0) {

		return console.log("error executing file", _0);
	});
	console.log("executed")
}

run().then(() => {
	console.log('finished')
	if (!__WATCH__)
		process.send('exit')
}).catch(e => console.log('error', e))