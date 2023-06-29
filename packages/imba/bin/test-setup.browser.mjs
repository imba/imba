import '@testing-library/jest-dom'
import {vi} from "vitest"
import * as domHelpers from '@testing-library/dom'
import 'imba/std'

vi.stubGlobal('eq', assert.deepStrictEqual)
vi.stubGlobal('neq', assert.notDeepStrictEqual)
vi.stubGlobal('ok', assert.ok)
vi.stubGlobal('nok', (b) => assert.ok(!b))

class MockPointerEvent{}
vi.stubGlobal("PointerEvent", MockPointerEvent)

global.screen = domHelpers.screen
global.waitFor = domHelpers.waitFor
global.prettyDOM = domHelpers.prettyDOM
global.logDOM = domHelpers.logDOM
