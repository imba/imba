// eslint-disable-next-line node/no-missing-import
import Inspector from 'virtual:imba-inspector-path:Inspector.imba';

function create_inspector_host() {
	const id = 'imba-inspector-host';
	if (document.getElementById(id) != null) {
		throw new Error('imba-inspector-host element already exists');
	}
	const el = document.createElement('div');
	el.setAttribute('id', id);
	document.getElementsByTagName('body')[0].appendChild(el);
	return el;
}

new Inspector({ target: create_inspector_host() });
