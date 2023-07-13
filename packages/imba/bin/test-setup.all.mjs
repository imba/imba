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
			const [a, b] = args
			if (nook) {
				expect(a).not.toStrictEqual(b)
			} else {
				expect(a).toStrictEqual(b)
			}
		}
	} catch (error) {
		if (args[2]) console.error(args[2])
		throw error
	}
}
vi.stubGlobal('ok', ok());

vi.stubGlobal('nok', ok(true));
