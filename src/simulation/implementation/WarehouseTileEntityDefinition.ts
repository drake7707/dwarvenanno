import { ProduceTileEntityDefinition } from "../core/entity/ProduceTileEntityDefinition";
import { StorageBuildingTileEntityDefinition } from "../core/entity/StorageBuildingTileEntityDefinition";
import { Size } from "../core/Size";
import { World } from "../core/World";

export class WarehouseTileEntityDefinition extends StorageBuildingTileEntityDefinition {

    public constructor() {
        super("warehouse", new Size(2, 2), 4, 2, ["wood", "bread", "wheat", "stone", "beef", "leather", "clothes"], true, 4, 7, 40);
        this.scanTargetPeriodicity = 5000;
        this.radius = 20;
        for (const item of this.itemsToFetch) {
            this.treshholdForItemsToFetch.put(item, this.outputStorageDefinition.maxNrOfItems - 5);
        }
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);
        if (!result)
            return false;
        // super already checks if there are entities with output storage of the item to fetch
        // so if there are, narrow it down to only windmills
        const entity = world.getTile(x, y).entity;
        if (entity !== null &&
            !(entity.definition instanceof ProduceTileEntityDefinition) &&
            !(entity.definition instanceof WarehouseTileEntityDefinition))
            return true;
        return false;
    }
}
