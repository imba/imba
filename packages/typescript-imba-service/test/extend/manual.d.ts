declare global {
    interface String {
        get test(): number;
        get element(): import("./def.imba").ΓappΞpanel;
        get element2(): globalThis.ImmediateDefJS;
        get el3(): typeof globalThis.someState;
    }
}

interface LocalString {
    get tast(): number;
}

declare global {
    interface String extends LocalString {
        
    }
}

export {}

// import * as __4 from '/Users/sindre/repos/imba/packages/typescript-imba-service/test/extend/def.imba';
/*
declare global {
    // export {SomeClass} from "/Users/sindre/repos/imba/packages/typescript-imba-service/test/extend/def.imba";
    type SomeClass = import("/Users/sindre/repos/imba/packages/typescript-imba-service/test/extend/def.imba").SomeClass;
	declare var SomeClass: typeof __4.SomeClass;
	// declare var SomeSubClass: typeof __4.SomeSubClass;
}
*/