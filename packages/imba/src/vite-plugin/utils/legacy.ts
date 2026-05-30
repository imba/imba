// @ts-ignore - bundled legacy imba1 compiler has no type declarations.
import imba1 from '../../../scripts/bootstrap.compiler.js';

type LegacyCompileOptions = {
	filename?: string;
	platform?: string;
	sourcePath?: string;
	target?: string;
	[key: string]: any;
};

const platformTargets: Record<string, string> = {
	browser: 'web',
	worker: 'webworker'
};

function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function isLegacyImba(filename: string): boolean {
	return /\.imba1(?:$|\?)/.test(filename);
}

function rewriteCommonJSImports(js: string): string {
	const identifier = '[A-Za-z_$][\\w$]*';
	const path = '([\\\'"][^\\\'"]+[\\\'"])';

	js = js.replace(
		new RegExp(`^var\\s+(${identifier})\\s*=\\s*require\\(${path}\\),\\s*(.+);$`, 'gm'),
		(_statement, namespace, source, bindings) => {
			const specifiers = bindings
				.split(/\s*,\s*/)
				.map((binding) => {
					const match = binding.match(new RegExp(`^(${identifier})\\s*=\\s*${escapeRegExp(namespace)}\\.(${identifier})$`));
					if (!match) return null;
					return match[1] == match[2] ? match[1] : `${match[2]} as ${match[1]}`;
				})
				.filter((specifier): specifier is string => !!specifier);

			return specifiers.length ? `import { ${specifiers.join(', ')} } from ${source};` : _statement;
		}
	);

	js = js.replace(
		new RegExp(`^var\\s+(${identifier})\\s*=\\s*require\\(${path}\\)\\.(${identifier});$`, 'gm'),
		(_statement, local, source, imported) =>
			`import { ${local == imported ? imported : `${imported} as ${local}`} } from ${source};`
	);

	js = js.replace(
		new RegExp(`^var\\s+(${identifier})\\s*=\\s*require\\(${path}\\);$`, 'gm'),
		(_statement, local, source) => `import * as ${local} from ${source};`
	);

	return js.replace(new RegExp(`^require\\(${path}\\);$`, 'gm'), (_statement, source) => `import ${source};`);
}

function wrapCommonJSExports(js: string): string {
	const names = new Set<string>();
	const exportPattern = /(?:^|[^\w$])exports\.([A-Za-z_$][\w$]*)\s*=/g;
	let match: RegExpExecArray | null;

	while ((match = exportPattern.exec(js))) {
		names.add(match[1]);
	}

	if (!names.size) return js;

	const declarations = [];
	const specifiers = [];

	for (const name of names) {
		const local = `__imba1_export_${name}`;
		declarations.push(`const ${local} = exports.${name};`);
		specifiers.push(name == 'default' ? `${local} as default` : `${local} as ${name}`);
	}

	return [`var exports = {};`, js, ...declarations, `export { ${specifiers.join(', ')} };`].join('\n');
}

export function compileLegacyImba(code: string, options: LegacyCompileOptions = {}) {
	const platform = options.platform || options.target || 'web';
	const target = platformTargets[platform] || platform;
	const sourcePath = options.sourcePath || options.filename;
	const res = imba1.compile(code, {
		...options,
		target,
		filename: options.filename || sourcePath,
		sourcePath
	});
	let js = res.js || '';

	if (js.indexOf('$_ =') > 0) {
		js = "var $_;\n" + js;
	}

	js = rewriteCommonJSImports(js);
	js = wrapCommonJSExports(js);

	return {
		js,
		css: res.css || '',
		warnings: res.warnings || [],
		errors: res.errors || [],
		sourcemap: res.sourcemap
	};
}
