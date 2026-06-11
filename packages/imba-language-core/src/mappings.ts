import type { CodeInformation, CodeMapping } from '@volar/language-core';

/**
 * Exact 1:1 spans (identifiers, literals) support every feature.
 */
export const EXACT_FEATURES: CodeInformation = {
	verification: true,
	completion: true,
	semantic: true,
	navigation: true,
	structure: true,
};

/**
 * Container spans (whole expressions/statements, where generated and source
 * lengths differ) act as fallbacks for diagnostics ranges and navigation, but
 * must not offer completions at clamped interior positions.
 *
 * `verification.shouldReport` is the future home of the diagnostic suppression
 * rules currently living in typescript-imba-plugin/src/diagnostics.imba.
 */
export const CONTAINER_FEATURES: CodeInformation = {
	verification: true,
	semantic: true,
	navigation: true,
	structure: true,
};

/**
 * Convert the imba compiler's locs.spans ([genStart, genEnd, srcStart, srcEnd]
 * quadruples, hierarchical and overlapping) into Volar CodeMappings.
 *
 * Exact-length spans are emitted first: Volar's SourceMap memo iterates
 * candidate mappings in array order, so precise leaf spans win over container
 * fallbacks when both match an offset.
 */
export function spansToMappings(spans: readonly (readonly number[])[]): CodeMapping[] {
	const exact: CodeMapping[] = [];
	const containers: CodeMapping[] = [];
	const seen = new Set<string>();

	for (const span of spans) {
		const [g0, g1, s0, s1] = span;
		if (!Number.isFinite(g0) || !Number.isFinite(g1) || !Number.isFinite(s0) || !Number.isFinite(s1)) {
			continue;
		}
		if (g1 < g0 || s1 < s0 || s0 < 0 || g0 < 0) {
			continue;
		}
		const key = `${g0},${g1},${s0},${s1}`;
		if (seen.has(key)) {
			continue;
		}
		seen.add(key);

		const sourceLength = s1 - s0;
		const generatedLength = g1 - g0;

		if (sourceLength === generatedLength) {
			exact.push({
				sourceOffsets: [s0],
				generatedOffsets: [g0],
				lengths: [sourceLength],
				data: EXACT_FEATURES,
			});
		} else {
			containers.push({
				sourceOffsets: [s0],
				generatedOffsets: [g0],
				lengths: [sourceLength],
				generatedLengths: [generatedLength],
				data: CONTAINER_FEATURES,
			});
		}
	}

	return [...exact, ...containers];
}
