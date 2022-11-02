const VITE_RESOLVE_MAIN_FIELDS = ['module', 'jsnext:main', 'jsnext'];

export const IMBA_RESOLVE_MAIN_FIELDS = ['imba', ...VITE_RESOLVE_MAIN_FIELDS];

export const IMBA_IMPORTS = [
	// 'imba/animate',
	// 'imba/easing',
	// 'imba/internal',
	// 'imba/motion',
	// 'imba/ssr',
	// 'imba/store',
	// 'imba/transition',
	// 'imba'
];

export const IMBA_HMR_IMPORTS = [
	// 'imba-hmr/runtime/hot-api-esm.js',
	// 'imba-hmr/runtime/proxy-adapter-dom.js',
	// 'imba-hmr'
];
