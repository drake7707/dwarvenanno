import { IUpkeepCost } from "../IUpkeepCost";
import { Size } from "../Size";
import { World } from "../World";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { TileEntity } from "./TileEntity";
import { TileEntityDefinition } from "./TileEntityDefinition";

export abstract class BuildingTileEntityDefinition extends TileEntityDefinition implements IUpkeepCost {
    public upkeepCost: number = 0;

    private readonly _availableNrOfWorkers: number = 0;
    get availableNrOfWorkers() { return this._availableNrOfWorkers; }

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, public blocked: boolean = true, availableNrOfWorkers: number = 0) {
        super(key, size, sourceTilesetX, sourceTilesetY, blocked);
        this._availableNrOfWorkers = availableNrOfWorkers;
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        return new BuildingTileEntity(this, world, x, y);
    }
}
