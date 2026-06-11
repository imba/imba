# Modules

## Syntax

```imba
import defaultExport from "module-name"
import * as name from "module-name"
import { export1 } from "module-name"
import { export1 as alias1 } from "module-name"
import { export1 , export2 } from "module-name"
import { foo , bar } from "module-name"
import { export1 , export2 as alias2 , [...] } from "module-name"
import defaultExport, { export1 [ , [...] ] } from "module-name"
import defaultExport, * as name from "module-name"
import "module-name"
```

## Examples

### Import default

```imba
import DefaultExport from './source'
```

### Import members

```imba
import {capitalize,camelize} from './util'
```

### Import members with alias

```imba app.imba
import {capitalize as upcase,camelize} from './util'
```

```imba util.imba
export def capitalize
    return 123

export def camelize
    return 123
```

### Import an entire module's contents

```imba main.imba
# [preview=console]
import * as utils from './util'
console.log utils.ping!, utils.pong!
```

```imba util.imba
export def ping
    return 123

export def pong
    return 123
```

### Import a single export from a module [preview=md]

```imba app.imba
# [preview=console]
import {myExport} from './util'
console.log myExport!
```

```imba util.imba
export def myExport
    return 123
```

### Importing web components [preview=md]

Web components are not explicitly imported by name. As long as the files
where your components are imported somewhere in your project they will
be available everywhere.

```imba app.imba
import './controls'

imba.mount do <div[pos:absolute inset:0 d:flex ja:center]>
    <my-component>
    <app-avatar>
```

```imba controls.imba
# no need to export this - it is globally available
# as long as the file is imported somewhere in your project
tag my-component
    <self[d:inline-block p:2]> "Custom component"

tag app-avatar
    <self[d:inline-block]> "Avatar"
```

### Importing a custom element [preview=md]

```imba app.imba
import {MyElement} from './element'

imba.mount do <div> <MyElement>
```

```imba element.imba
export tag MyElement
    <self[d:inline-block p:2]> "Custom element here"
```

### Importing styles [preview=md]

Global styles that you want included in your project must be imported somewhere.

```imba app.imba
import './styles'

imba.mount do <div>
    <p> "Globally styled"
```

```imba styles.imba
global css
    p color:blue5
```
