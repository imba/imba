// Stand-in for 'imba/runtime' so the bundled bin doesn't pull in the full
// runtime. Contains only the helpers the compiled scaffolder output uses
// (definitions copied verbatim from imba's src/imba/runtime.mjs).

export function iterable$(a) {
	return a?.toIterable?.() || a;
}
