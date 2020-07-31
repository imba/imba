# import * as monarch from './monarch'

import {grammar} from './grammar'
import {compile} from './monarch/compile'

import {MonarchTokenizer} from './monarch/lexer'
export {Token} from './monarch/token'

var compiled = compile('imba',grammar)
export const lexer = new MonarchTokenizer('imba',compiled)