import { Point, greet } from './main.imba';

export const p = new Point();
export const d: number = p.dist();
export const s: string = greet('world');

// deliberate type error: greet returns string — proves imba types flow into ts
export const bad: number = greet('world');
