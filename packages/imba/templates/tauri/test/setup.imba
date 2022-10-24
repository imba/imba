import '@testing-library/jest-dom'
import {vi} from "vitest"
# JSDOM doesn't implement pointer event class
# see https://github.com/jsdom/jsdom/issues/2527
class MockPointerEvent
vi.stubGlobal "PointerEvent", MockPointerEvent
