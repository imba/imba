import {vi} from "vitest"
import assert from "assert"

vi.stubGlobal('eq', assert.equal)
vi.stubGlobal('ok', assert.ok)
vi.stubGlobal('nok', (b) => assert.ok(!b))
