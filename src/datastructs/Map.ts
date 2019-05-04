export class Map<TValue> {
    private obj: any;

    constructor() {
        this.obj = {};
    }

    public containsKey(key: string): boolean {
        return this.obj.hasOwnProperty(key) && typeof this.obj[key] !== "undefined";
    }

    public getKeys(): string[] {
        const keys: string[] = [];
        for (const el in this.obj) {
            if (this.obj.hasOwnProperty(el))
                keys.push(el);
        }
        return keys;
    }

    public get(key: string): TValue {
        const o = this.obj[key];
        if (typeof o === "undefined")
            return null;
        else
            return <TValue>o;
    }

    public put(key: string, value: TValue): void {
        this.obj[key] = value;
    }

    public remove(key: string) {
        delete this.obj[key];
    }

    clone(): Map<TValue> {
        const m = new Map<TValue>();
        m.obj = {};
        for (const p in this.obj) {
            m.obj[p] = this.obj[p];
        }
        return m;
    }
}
