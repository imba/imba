import '@testing-library/jest-dom'
import {vi} from "vitest"
import * as domHelpers from '@testing-library/dom'

vi.stubGlobal('eq', assert.equal)
vi.stubGlobal('ok', assert.ok)
vi.stubGlobal('nok', (b) => assert.ok(!b))

class MockPointerEvent{}
vi.stubGlobal("PointerEvent", MockPointerEvent)

global.screen = domHelpers.screen
global.waitFor = domHelpers.waitFor
global.prettyDOM = domHelpers.prettyDOM
global.logDOM = domHelpers.logDOM
