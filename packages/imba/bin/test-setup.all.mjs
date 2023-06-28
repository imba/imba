import {vi} from "vitest"
import assert from "assert"

vi.stubGlobal('eq', assert.deepStrictEqual)
vi.stubGlobal('neq', assert.notDeepStrictEqual)
vi.stubGlobal('ok', assert.ok)
vi.stubGlobal('nok', (b) => assert.ok(!b))
