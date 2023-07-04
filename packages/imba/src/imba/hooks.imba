import {emit,listen} from './utils'

export const hooks = {
	on: do(ev,cb) listen(this,ev,cb)
	inited: do
		emit(this,'inited',[$1])
}

export def use_hooks
	global.imba.uses_hooks = yes
	yes

# let instance = global.imba ||= {}
# instance.hooks = hooks
