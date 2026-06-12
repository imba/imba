// parity: typescript-imba-plugin util.imba ToImbaMap/toImbaIdentifier.
// The compiler encodes imba-only identifier characters as Greek letters in
// the generated TS; user-facing strings must be converted back.

const TO_IMBA: Record<string, string> = {
	Ξ: '-',
	Φ: '?',
	Ψ: '#',
	Γ: '',
	α: '@',
};

const TO_IMBA_REGEX = /[ΞΦΨΓα]/gu;

export function toImbaIdentifier(raw: string): string {
	if (raw && raw[0] === 'Ω') {
		raw = raw.split('Ω')[1];
	}
	return raw ? raw.replace(TO_IMBA_REGEX, m => TO_IMBA[m]) : raw;
}

/**
 * Convert compiler-encoded identifiers inside a human-readable message.
 * Unlike the old plugin this is applied per feature result (diagnostic
 * messages, hover text), never to whole protocol payloads — user strings
 * that legitimately contain these characters are no longer mangled.
 */
export function toImbaString(text: string): string {
	return text.replace(TO_IMBA_REGEX, m => TO_IMBA[m]);
}
