import '@testing-library/jest-dom'
import {vi} from "vitest"
import * as domHelpers from '@testing-library/dom'

class MockPointerEvent
vi.stubGlobal "PointerEvent", MockPointerEvent

global.screen = domHelpers.screen
global.waitFor = domHelpers.waitFor
global.prettyDOM = domHelpers.prettyDOM
global.logDOM = domHelpers.logDOM