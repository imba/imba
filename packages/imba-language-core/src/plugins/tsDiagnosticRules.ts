// parity: typescript-imba-plugin src/diagnostics.imba (Rules table) and
// patches.imba filterDiagnostics quick suppressions (6133/7043/7044).
//
// Imba uses TS for tooling, not as a strict type gate — many dynamic imba
// patterns are legal but trip TS. Rules are evaluated in order; 'suppress'
// drops the diagnostic, 'downgrade' lowers it to warning and keeps scanning
// (matching the old plugin's control flow).

export interface TsDiagnosticLike {
	code?: number | string;
	message: string;
	/** generated (TS) text at the diagnostic range, when available */
	text?: string;
	severity?: number;
}

type RuleResult = 'suppress' | 'downgrade' | undefined;

interface Rule {
	code: number;
	message?: RegExp;
	text?: RegExp;
	test?(item: TsDiagnosticLike): RuleResult;
	action?: 'suppress' | 'downgrade';
}

const RULES: Rule[] = [
	{ code: 6133, message: /^'(\$\$|self|slf|\$\d+)'/ },
	{ code: 7043 },
	{ code: 7044 },
	{ code: 7045 }, // member implicitly any (dogfood: 62×)
	{ code: 7046 },
	// CSS custom properties set as element properties (dogfood: bulk of 700×).
	// Rules run on RAW messages: '-' is still encoded as Ξ at this stage.
	{ code: 2339, message: /^Property '(--|ΞΞ)/ },
	// compiler-generated tag temporaries leaking into odd code shapes
	{ code: 2304, message: /^Cannot find name 'τ/ },
	// the compiler emits this.dataForTagName(...) in every tag class but the
	// runtime API is missing from the typings (dev-host finding 2026-06-12;
	// suppress until the declaration lands in imba/typings)
	{ code: 2339, message: /^Property 'dataForTagName'/ },
	{ code: 2322, text: /^\$\d+/ },
	{ code: 2610 }, // accessor overridden by property
	{ code: 2611 },
	{ code: 2612 },
	{ code: 2320, action: 'downgrade' },
	{ code: 2322, message: /^Type '(boolean|string|number|ImbaAsset|typeof import\("data:text\/asset;\*"\))' is not assignable to type '(string|number|boolean|object)'/ },
	{ code: 2308, message: /exported a member named 'Ω/ },
	{ code: 2339, message: /on type 'EventTarget'/ },
	{ code: 2339, message: /\$CARET\$/ },
	{ code: 2339, message: /Property '_\$SYM\$/ },
	{ code: 2350, message: /Only a void function can be called/ },
	{ code: 2510 }, // base constructors must have the same return type
	{
		code: 2551,
		test: item => (/^Property 'Ψ/u.test(item.message) ? 'suppress' : undefined),
	},
	{
		code: 2339,
		test: item => (/^Property 'Ψ/u.test(item.message) ? 'suppress' : 'downgrade'),
	},
	{ code: 2339, message: /on type '(.*)\[\]'/ },
	{ code: 2339, message: /on type 'Window'/ },
	{ code: 2339, message: /on type 'Window & typeof globalThis'/ },
	{ code: 2359, action: 'downgrade' },
	{ code: 2367 },
	{ code: 2425 },
	{ code: 2426 },
	{ code: 2556, text: /\.\.\.arguments/ },
	{ code: 2540, message: /^Cannot assign to / },
	{ code: 2557, text: /\.\.\.arguments/ },
	{ code: 2538 }, // cannot be used as index type
	{
		code: 2554,
		test: item => {
			const m = item.message.match(/Expected (\d+) arguments, but got (\d+)/);
			return m && parseInt(m[2]) > parseInt(m[1]) ? 'suppress' : undefined;
		},
	},
	{ code: 2339, message: /on type '\{\}'/ },
	{ code: 2304, message: /Svg[A-Z]/ },
	{ code: 2307, message: /\.(txt|css|a?png|jpe?g|gif|svg)'/ },
	{ code: 6232 }, // declaration augments declaration in other file
];

/** 'suppress' to drop, 'downgrade' to report as warning, undefined to keep as-is. */
export function filterTsDiagnostic(item: TsDiagnosticLike): RuleResult {
	let downgraded: RuleResult;
	for (const rule of RULES) {
		if (rule.code !== Number(item.code)) {
			continue;
		}
		if (rule.test) {
			const res = rule.test(item);
			if (res === 'suppress') {
				return 'suppress';
			}
			if (res === 'downgrade') {
				downgraded = 'downgrade';
			}
			continue;
		}
		if (rule.text && !(rule.text instanceof RegExp && item.text !== undefined && rule.text.test(item.text))) {
			continue;
		}
		if (rule.message && !rule.message.test(item.message)) {
			continue;
		}
		if (rule.action === 'downgrade') {
			downgraded = 'downgrade';
			continue;
		}
		return 'suppress';
	}
	return downgraded;
}
