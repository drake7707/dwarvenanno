import { Size } from "../Size";
import { Storage } from "../storage/Storage";
import { World } from "../World";
import { Worker } from "./../worker/Worker";
import { TileEntity } from "./TileEntity";

import { IMetadata } from "../metadata/IMetadata";
import { ProductionMetadata } from "../metadata/ProductionMetadata";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { FetchItemBuildingTileEntityDefinition } from "./FetchItemBuildingTileEntityDefinition";
import { ProduceTileEntityDefinition } from "./ProduceTileEntityDefinition";

export class ProductionBuildingTileEntityDefinition extends FetchItemBuildingTileEntityDefinition {
    public outputStorageDefinition: StorageContainerDefinition;

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, producedItems: string[], blocked: boolean = true, availableNrOfWorkers: number = 0, nrOfStorageSlots: number = 1, maxNrOfItems: number = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, producedItems, blocked, availableNrOfWorkers);
        this.outputStorageDefinition = new StorageContainerDefinition(nrOfStorageSlots, maxNrOfItems);
    }

    public createMetadata(): IMetadata {
        return new ProductionMetadata(this.outputStorageDefinition);
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        const b = new BuildingTileEntity(this, world, x, y);
        for (const w of b.workers)
            w.color = "#00FF00";
        return b;
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);
        if (!result)
            return false;

        // super already checks if there are entities with output storage of the item to fetch
        // so if there are, narrow it down to only wheatfarms
        const entity = world.getTile(x, y).entity;
        if (entity !== null && entity.definition instanceof ProduceTileEntityDefinition)
            return true;
        return false;
    }

    protected getTargetStorageForDropOff(entity: TileEntity): Storage {
        const metadata = entity.getMetadata<ProductionMetadata>();
        return metadata.outputStorage;
    }

    protected onItemDroppedOff(worker: Worker, item: string, amount: number) {
        worker.world.scoring.onItemProduced(item, amount);
    }
}
