import '@testing-library/jest-dom'
import {vi} from "vitest"
import * as domHelpers from '@testing-library/dom'
import 'imba/std'

vi.stubGlobal('ok',function(_0) {
	if (arguments.length <= 1) {
		return assert.ok(_0);
	} else {
		return assert.deepStrictEqual(...arguments);
	};
});

vi.stubGlobal('nok',function(_0) {
	if (arguments.length <= 1) {
		return assert.ok(!(_0));
	} else {
		return assert.notDeepStrictEqual(...arguments);
	};
});

class MockPointerEvent{}
vi.stubGlobal("PointerEvent", MockPointerEvent)

global.screen = domHelpers.screen
global.waitFor = domHelpers.waitFor
global.prettyDOM = domHelpers.prettyDOM
global.logDOM = domHelpers.logDOM
