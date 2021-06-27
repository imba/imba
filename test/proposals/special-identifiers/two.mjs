export const alpha = 1;
export const beta = 1;
export const charlie = 1;

export function method() {

    console.log("called on?!", this, this.value);
    this.value = Math.random();
    return this;
}

export default 1000;