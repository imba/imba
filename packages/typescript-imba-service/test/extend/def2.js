export class LateDefJS {
    main() { return this; }
}

globalThis.LateDefJS = LateDefJS;

globalThis.ImmediateDefJS = class ImmediateDefJS {
    hello() { return true }
    main() { return this; }
}
export {ImmediateDefJS}

globalThis.someState = new ImmediateDefJS;