import { ctx, img, TILE_HEIGHT, TILE_WIDTH } from "../../../globals";
import { IMetadata } from "../metadata/IMetadata";
import { Position } from "../Position";
import { Size } from "../Size";
import { World } from "../World";
import { TileEntity } from "./TileEntity";

export abstract class TileEntityDefinition {

    protected sourceTilesetPosition: Position;

    private readonly _size: Size;
    get size() { return this._size; }

    constructor(public key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, public blocked: boolean = false) {
        this._size = size;
        this.sourceTilesetPosition = new Position(sourceTilesetX, sourceTilesetY);
    }

    public abstract createInstance(world: World, x: number, y: number): TileEntity;

    public abstract createMetadata(): IMetadata;

    public abstract initializeEntity(world: World, entity: TileEntity): void;

    public destroyEntity(world: World, entity: TileEntity) {
        // do nothing by default, this is called when the entity is removed
        // from the world. Derived definitions can use this to remove event handlers
        // and do other cleanup to prevent memory leaks
    }

    public update(world: World, entity: TileEntity, timePassed: number) {
        // be default do nothing
    }

    public draw(world: World, entity: TileEntity, x: number, y: number) {
        ctx.drawImage(img, this.sourceTilesetPosition.x * TILE_WIDTH, this.sourceTilesetPosition.y * TILE_HEIGHT, this.size.width * TILE_WIDTH, this.size.height * TILE_HEIGHT, x * TILE_WIDTH, y * TILE_HEIGHT, this.size.width * TILE_WIDTH, this.size.height * TILE_HEIGHT);
    }
}
