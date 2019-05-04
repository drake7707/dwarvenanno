import { Position } from "./Position";
import { Size } from "./Size";

export class Area {

    constructor(public position: Position, public size: Size) { }

    public contains(x: number, y: number): boolean {
        return x >= this.position.x && x < this.position.x + this.size.width &&
            y >= this.position.y && y < this.position.y + this.size.height;
    }

    public equals(area: Area) {
        return this.position.x === area.position.x && this.position.y === area.position.y &&
            this.size.width === area.size.width && this.size.height === area.size.height;
    }

    public static create(x: number, y: number, width: number, height: number): Area {
        return new Area(new Position(Math.floor(x), Math.floor(y)), new Size(width, height));
    }
}
