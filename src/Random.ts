
export class Random {
    private seed: number;
    constructor(seed?: number) {
        if (typeof seed === "undefined")
            seed = new Date().getTime();
        this.seed = seed;
    }
    public next(): number {
        const x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}
