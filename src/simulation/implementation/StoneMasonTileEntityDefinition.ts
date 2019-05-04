import { ProductionBuildingTileEntityDefinition } from "../core/entity/ProductionBuildingTileEntityDefinition";

import { Size } from "../core/Size";
import { World } from "../core/World";
import { BoulderTileEntityDefinition } from "./BoulderTileEntityDefinition";

export class StoneMasonTileEntityDefinition extends ProductionBuildingTileEntityDefinition {

    public constructor() {
        super("stonemason", new Size(2, 2), 26, 2, ["stone"], true, 1, 1, 40);
        this.scanTargetPeriodicity = 5000;
        this.timeToRetrieveItem = 5000;
        this.upkeepCost = 50;
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);
        if (!result)
            return false;

        const entity = world.getTile(x, y).entity;
        if (entity !== null && (entity.definition instanceof BoulderTileEntityDefinition))
            return true;

        return false;
    }
}
