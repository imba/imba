type IsFunction<T> = T extends (...args: any[]) => any ? true : false;

type ConvertPropertiesToFunction<T> = {
    [K in keyof T]: IsFunction<T[K]> extends true
        ? T[K] // if original property is a function, keep its type
        : (arg: T[K]) => void; // if not a function, make it of the function type with an argument equal to the original property type
    };

function accessor<T>(accessor: T):ConvertPropertiesToFunction<T> {
    return
}

function accessor2<T>(accessor: T,other?:ConvertPropertiesToFunction<T>): {
    return accessor;
}


interface ImbaStorage extends Function {
    [key: string]: any;
    (ns: string): ImbaStorage
}

let stuff:ImbaStorage;

stuff.tester
stuff('tester')

const palette = {
    red: [255, 0, 0],
    green: "#00ff00",
    test: ()=>true,
    bleu: [0, 0, 255],
    other: 10
//  ~~~~ The typo is now caught!
};

if(!(palette.test instanceof Function)){
    palette.test = 10;
} else {
    palette.test()
}


if(palette.test instanceof Function){
    palette.test()
} else {
    palette.test
    palette.test = 10;
}

// if(palette.red instanceof Function) palette.red()
// else palette.red = [];

let fn = (a,$4=accessor(palette)) => {
    (
        $4.test(),
        $4.other(242),
        $4.other("242")

    )
}