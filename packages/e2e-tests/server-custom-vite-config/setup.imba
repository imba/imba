import '@testing-library/jest-dom'
import {vi} from "vitest"
class MockPointerEvent
vi.stubGlobal "PointerEvent", MockPointerEvent