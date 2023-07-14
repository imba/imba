import { vi } from "vitest"
import assert from "assert"
import 'imba/std'

vi.stubGlobal('rejects', assert.rejects)

const ok = (nook = false) => (...args) => {
	try {
		if (args.length <= 1) {
			if (nook) {
				return expect(args[0]).not.toBeTruthy()
			} else {
				return expect(args[0]).toBeTruthy()
			}
		} else {
			let i = 0
			while (i < args.length - 1) {
				if (nook) {
					expect(args[i]).not.toStrictEqual(args[i + 1])
				} else {
					expect(args[i]).toStrictEqual(args[i + 1])
				}
				i++
			};

		}
	} catch (error) {
		if (args[2]) console.error(args[2])
		throw error
	}
}
vi.stubGlobal('ok', ok());

vi.stubGlobal('nok', ok(true));
