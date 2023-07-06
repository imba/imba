import {vi} from "vitest"
import assert from "assert"
import 'imba/std'

vi.stubGlobal('rejects', assert.rejects)

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
