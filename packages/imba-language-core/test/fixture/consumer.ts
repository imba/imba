import { Point, greet } from './main.imba';
// extensionless import resolving to util.imba (parity: old moduleSuffixes)
import { double } from './util';
// extensionless import resolving to the comp.web.imba platform variant
import { platform } from './comp';

export const p = new Point();
export const d: number = p.dist();
export const s: string = greet('world');
export const n: number = double(4);
export const w: string = platform();

// deliberate type error: greet returns string — proves imba types flow into ts
export const bad: number = greet('world');
