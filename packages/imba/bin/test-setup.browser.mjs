import '@testing-library/jest-dom'
import {vi} from "vitest"
import * as domHelpers from '@testing-library/dom'
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

class MockPointerEvent{}
vi.stubGlobal("PointerEvent", MockPointerEvent)

global.screen = domHelpers.screen
global.waitFor = domHelpers.waitFor
global.prettyDOM = domHelpers.prettyDOM
global.logDOM = domHelpers.logDOM
