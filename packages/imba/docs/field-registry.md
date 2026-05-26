# Imba Field Registry

The Imba compiler can emit a type-only registry for statically analyzable class
field declarations that use decorator-style field descriptors.

This is a framework-agnostic compiler feature. Imba does not know or care what a
descriptor such as `@embed` means. It only emits syntactic and type facts that
libraries can interpret later in TypeScript.

## Example

Given Imba source:

```imba
class Variant
class Item
	stuff @embed(Variant)
```

declaration output includes a global registry entry shaped like:

```ts
declare global {
	interface ImbaFieldRegistry {
		"_$INTERNAL$_imbaFieldRegistry:embed:stuff:imba:opaque-generated-key": {
			owner: Item
			ownerType: typeof Item
			field: "stuff"
			decorator: "embed"
			firstArg: Variant
			firstArgType: typeof Variant
			args: [typeof Variant]
		}
	}
}

interface Variant {
	readonly "_$INTERNAL$_imbaFieldTarget:embed:stuff:imba:opaque-generated-key"?: ImbaFieldRegistry["_$INTERNAL$_imbaFieldRegistry:embed:stuff:imba:opaque-generated-key"]
}
```

The registry key is opaque. It starts with `_$INTERNAL$_` so Imba tooling can
hide it as an internal path, then includes the decorator and field name so helper
types can still filter by key prefix. Code should prefer the helper types below
instead of depending directly on the complete key format. The target-side
`_$INTERNAL$_imbaFieldTarget:*` key is also opaque and exists only for type-only
inverse lookup.

## Base Types

Imba's base declarations provide:

```ts
interface ImbaFieldRegistry {}

type ImbaFieldRegistryKeyPrefix =
	'_$INTERNAL$_imbaFieldRegistry'

type ImbaFieldTargetKeyPrefix =
	'_$INTERNAL$_imbaFieldTarget'

type ImbaFieldEntry =
	ImbaFieldRegistry[keyof ImbaFieldRegistry]

type ImbaFieldEntriesForDecorator<D extends string> =
	ImbaFieldRegistry[Extract<keyof ImbaFieldRegistry, `${ImbaFieldRegistryKeyPrefix}:${D}:${string}`>]

type ImbaFieldEntriesForField<F extends string> =
	ImbaFieldRegistry[Extract<keyof ImbaFieldRegistry, `${ImbaFieldRegistryKeyPrefix}:${string}:${F}:${string}`>]

type ImbaFieldEntriesForDecoratorField<D extends string, F extends string> =
	ImbaFieldRegistry[Extract<keyof ImbaFieldRegistry, `${ImbaFieldRegistryKeyPrefix}:${D}:${F}:${string}`>]

type ImbaFieldEntriesForTarget<T> =
	NonNullable<T[Extract<keyof T, `${ImbaFieldTargetKeyPrefix}:${string}`>]>

type ImbaFieldEntriesForDecoratorTarget<D extends string, T> =
	NonNullable<T[Extract<keyof T, `${ImbaFieldTargetKeyPrefix}:${D}:${string}`>]>

type ImbaFieldEntriesForDecoratorFirstArg<D extends string, A> =
	ImbaFieldEntriesForDecoratorTarget<D, A>

type ImbaFieldEntriesForDecoratorFirstArgType<
	D extends string,
	A extends abstract new (...args: any) => any
> =
	ImbaFieldEntriesForDecoratorTarget<D, InstanceType<A>>
```

Use `ImbaFieldEntry` when you want every field registry entry. Use
`ImbaFieldEntriesForDecorator<"name">` when you only care about one descriptor
name. Use `ImbaFieldEntriesForDecoratorField<"name", "field">` when both the
descriptor and field name are known. Use
`ImbaFieldEntriesForDecoratorFirstArg<"name", SomeClass>` when you want entries
where the first descriptor argument is the target type.

```ts
type EmbedFields =
	ImbaFieldEntriesForDecorator<"embed">

type EmbedOwners =
	EmbedFields["owner"]

type EmbedStuffFields =
	ImbaFieldEntriesForDecoratorField<"embed", "stuff">

type EmbedTargets =
	EmbedFields["firstArg"]

type EmbedOwnersForScreen =
	ImbaFieldEntriesForDecoratorFirstArg<"embed", Screen>["owner"]
```

Filtering by key prefix is intended to be cheaper than distributing over every
structural registry entry and checking `{ decorator: "embed" }`. Including both
the descriptor and field name in the key prefix also makes it easy to compare
field-specific lookup strategies.

## Entry Shape

Each entry has this structural shape:

```ts
{
	owner: OwnerInstanceType
	ownerType: typeof OwnerClass
	field: "fieldName"
	decorator: "decoratorName"
	firstArg: FirstArgInstanceType
	firstArgType: typeof FirstArgClass
	args: [typeof ArgClass, unknown]
}
```

Field meanings:

- `owner`: instance type of the class that declared the field
- `ownerType`: constructor/static side of the owner class
- `field`: string literal field name
- `decorator`: string literal descriptor name without `@`
- `firstArg`: instance-side type for the first descriptor argument
- `firstArgType`: constructor/static-side type for the first descriptor
  argument
- `args`: tuple of type-nameable descriptor arguments, using `unknown` for
  arguments that cannot be safely named in declaration output

Registry entries are only emitted for descriptors with at least one argument, so
`firstArg` and `firstArgType` are always present on emitted entries. For a
non-nameable first argument, both fields are emitted as `unknown`.

## Nameability

Entries are emitted only when the owner class can be named safely in declaration
output. Top-level named classes and exported named classes are supported.

Local or nested classes inside functions are skipped as owners. Anonymous owners
are skipped. Descriptor arguments that cannot be named are represented as
`unknown` rather than crashing compilation.

```imba
class Variant
class Item
	good @embed(Variant)
	fallback @embed(do Variant)
```

Conceptually produces:

```ts
{
	owner: Item
	ownerType: typeof Item
	field: "good"
	decorator: "embed"
	firstArg: Variant
	firstArgType: typeof Variant
	args: [typeof Variant]
}

{
	owner: Item
	ownerType: typeof Item
	field: "fallback"
	decorator: "embed"
	firstArg: unknown
	firstArgType: unknown
	args: [unknown]
}
```

## V1 Scope

Supported:

```imba
field @decorator(SomeClass)
field @decorator(SomeClass, OtherClass)
```

Current limits:

- Identifier descriptor names are supported.
- Descriptors without arguments are skipped.
- Qualified descriptor names may be expanded later.
- Static fields are skipped.
- Local/nested owner classes are skipped.
- Non-nameable descriptor args become `unknown`.
- Target-side inverse keys are emitted only when the first argument target can
  be safely augmented by name.
- Output is declaration/type-only and has no runtime effect.

## Consumer Guidance

Prefer:

```ts
type EmbedFields =
	ImbaFieldEntriesForDecorator<"embed">

type EmbedStuffFields =
	ImbaFieldEntriesForDecoratorField<"embed", "stuff">

type EmbedOwnersForScreen =
	ImbaFieldEntriesForDecoratorFirstArg<"embed", Screen>["owner"]
```

over:

```ts
type EmbedFields =
	Extract<ImbaFieldEntry, { decorator: "embed" }>
```

The latter works, but it asks TypeScript to distribute over all field entries.
The helper filters on prefixed keys first, which should scale better when many
unrelated descriptors are registered.

## Inverse Lookup Direction

The main reason to register descriptor arguments is inverse lookup. Forward
inspection, such as finding the fields on an owner class, can usually be done
from the owner type itself. The expensive question is usually the reverse:
given a target type, which owner classes and fields point at it through a
descriptor such as `@embed(Target)`?

The registry emits an optional hidden property onto the first argument target
when that target can be augmented safely:

```ts
interface Target {
	readonly "_$INTERNAL$_imbaFieldTarget:embed:field:imba:opaque-generated-key"?: ImbaFieldRegistry["_$INTERNAL$_imbaFieldRegistry:embed:field:imba:opaque-generated-key"]
}
```

The helper types read those target-owned keys:

```ts
type EmbeddersOf<T> =
	ImbaFieldEntriesForDecoratorFirstArg<"embed", T>["owner"]
```

This avoids the structural-type trap of filtering the global union with
`Extract<..., { firstArg: T }>`. The lookup starts from keys that were emitted
onto the actual target interface, so unrelated classes with similar instance
shapes do not match just because they are structurally compatible.

The target-side property is optional and readonly. It does not require a runtime
field, and it should not be treated as a semantic API. Its name is deliberately
opaque.

## TypeScript Plugin

Editor/type-server usage goes through the `typescript-imba-plugin` package. That
package injects its own bundled `typings/imba.d.ts`, so the base registry
interface and helper aliases need to exist there as well as in
`packages/imba/typings/imba.d.ts`.

No separate compiler hook is needed in the plugin for the field registry entries.
The plugin already compiles Imba files with the TypeScript target and forwards
the generated virtual TypeScript text to the TypeScript server, so inline
`declare global` registry augmentations flow through with the rest of the
compiled declaration/type output.
