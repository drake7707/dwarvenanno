import { ProcessBuildingTileEntityDefinition } from "../core/entity/ProcessBuildingTileEntityDefinition";

import { Size } from "../core/Size";

import { ProcessResult } from "../core/entity/ProcessResult";

import { World } from "../core/World";

export class WindMillTileEntityDefinition extends ProcessBuildingTileEntityDefinition {

    constructor() {
        super("windmill", new Size(2, 2), 12, 2, "wheat", true, 1, 1, 40, 1, 40);
        this.scanTargetPeriodicity = 5000;
        this.upkeepCost = 20;
    }

    public getProcess(item: string, amount: number): ProcessResult {
        const success = item === "wheat" && amount >= 4;
        return new ProcessResult(success, "wheat", 4, ["flour"], [1]);
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);

        if (!result)
            return false;
        // super already checks if there are entities with output storage of the item to fetch
        // so if there are, narrow it down to only wheatfarms
        const entity = world.getTile(x, y).entity;

        if (entity !== null && entity.definition.key === "wheatfarm")
            return true;

        return false;
    }
}
