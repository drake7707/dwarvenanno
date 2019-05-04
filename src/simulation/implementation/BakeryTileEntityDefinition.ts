import { ProcessBuildingTileEntityDefinition } from "../core/entity/ProcessBuildingTileEntityDefinition";

import { ProcessResult } from "../core/entity/ProcessResult";
import { Size } from "../core/Size";
import { World } from "../core/World";

export class BakeryTileEntityDefinition extends ProcessBuildingTileEntityDefinition {

    constructor() {
        super("bakery", new Size(2, 2), 14, 2, "flour", true, 1, 1, 40, 1, 40);
        this.scanTargetPeriodicity = 5000;
        this.upkeepCost = 50;
    }

    public getProcess(item: string, amount: number): ProcessResult {
        const success = item === "flour" && amount >= 2;
        return new ProcessResult(success, "flour", 2, ["bread"], [1]);
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);
        if (!result)
            return false;
        // super already checks if there are entities with output storage of the item to fetch
        // so if there are, narrow it down to only windmills
        const entity = world.getTile(x, y).entity;
        if (entity !== null && entity.definition.key === "windmill")
            return true;
        return false;
    }
}
