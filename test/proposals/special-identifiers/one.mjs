import { fix } from './util.mjs';
import './three.mjs'
import * as stuff from './two.mjs';
const stuff2 = fix(stuff);
console.log("hello", stuff, stuff2);
stuff.method();
stuff2.method();

