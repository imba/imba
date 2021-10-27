declare global {
    namespace NodeJS {
        interface Global {
            ils: any;
        }
    }

    declare namespace globalThis {
        const ils: any;
    }
}

