export class Position {
    public constructor(public x: number, public y: number) { }
    
    public toString(): string {
        return `${this.x},${this.y}`;
    }
}
