import { Area } from "../Area";
import { IMetadata } from "../metadata/IMetadata";
import { Position } from "../Position";
import { World } from "../World";
import { TileEntityDefinition } from "./TileEntityDefinition";
export class TileEntity {

    protected position: Position;

    private readonly _definition: TileEntityDefinition;
    get definition(): TileEntityDefinition { return this._definition; }

    private readonly metadata: IMetadata = null;
    public getMetadata<T extends IMetadata>() { return <T>this.metadata; }

    public id: number;

    public constructor(definition: TileEntityDefinition, world: World, x: number, y: number) {
        this.position = new Position(x, y);
        this._definition = definition;
        this.metadata = definition.createMetadata();
    }

    public isBlocked(world: World): boolean {
        return this._definition.blocked;
    }

    public getArea(): Area {
        return new Area(this.position, this._definition.size);
    }

    public update(world: World, timePassed: number) {
        // update worker behaviour according to the definition
        this._definition.update(world, this, timePassed);
    }

    public draw(world: World) {
        this._definition.draw(world, this, this.position.x, this.position.y);
    }
}
