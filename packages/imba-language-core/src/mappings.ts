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
 * lengths differ) exist ONLY for range mapping where boundaries align
 * (diagnostics, structure). Position-level features (navigation, hover,
 * completion) must not travel through them: translateOffset clamps interior
 * positions to `min(relativePos, toLength)`, which lands on unrelated tokens
 * — e.g. a tag-body position clamping onto a class field, producing phantom
 * definitions. The old plugin's o2iRange had the same boundary-only rule.
 */
export const CONTAINER_FEATURES: CodeInformation = {
	verification: true,
	structure: true,
};

/**
 * Generated-only placeholders (e.g. the `$CARET$` identifier the compiler
 * emits for incomplete member accesses like `FLAGS.`) map a generated range
 * onto a single source point. Unlike real containers they are SAFE for
 * position-level features — every interior offset clamps to that one point —
 * and completion edits MUST map through them: TS's replacement span for a
 * dot-triggered completion covers `.$CARET$`, and if its end can't map back
 * Volar drops the textEdit, leaving a dotted insertText that clients splice
 * as `FLAGS..RELUNIT` (dev-host finding 2026-06-12).
 */
export const PLACEHOLDER_FEATURES: CodeInformation = {
	verification: true,
	structure: true,
	completion: true,
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
				data: sourceLength === 0 && generatedLength > 0 ? PLACEHOLDER_FEATURES : CONTAINER_FEATURES,
			});
		}
	}

	return [...exact, ...containers];
}
