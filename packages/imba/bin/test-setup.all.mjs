import { vi } from "vitest"
import assert from "assert"
import 'imba/std'

vi.stubGlobal('rejects', assert.rejects)

vi.stubGlobal('ok',function(...args) {
	if (args.length <= 1) {
		return expect(args[0]).toBeTruthy()
	} else {
		const [a, b] = args
		expect(a).toStrictEqual(b)
	};
});

vi.stubGlobal('nok',function(...args) {
	if (args.length <= 1) {
		return expect(args[0]).not.toBeTruthy()
	} else {
		const [a, b] = args
		expect(a).not.toStrictEqual(b)
	};
});
