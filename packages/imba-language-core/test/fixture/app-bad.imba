import {greet} from './main'

# deliberate: greet expects a string — proves stdlib/global types are live
export const oops = greet(123)
