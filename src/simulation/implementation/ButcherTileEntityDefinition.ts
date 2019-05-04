import { ProcessBuildingTileEntityDefinition } from "../core/entity/ProcessBuildingTileEntityDefinition";

import { ProcessResult } from "../core/entity/ProcessResult";
import { Size } from "../core/Size";
import { World } from "../core/World";

export class ButcherTileEntityDefinition extends ProcessBuildingTileEntityDefinition {

    constructor() {
        super("butcher", new Size(2, 2), 30, 2, "cow", true, 1, 1, 40, 2, 40);
        this.scanTargetPeriodicity = 5000;
        this.upkeepCost = 80;
    }

    public getProcess(item: string, amount: number): ProcessResult {
        const success = item === "cow" && amount >= 1;
        return new ProcessResult(success, "cow", 1, ["leather", "beef"], [1, 2]);
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const result = super.isTarget(world, x, y, item);
        if (!result)
            return false;

        const entity = world.getTile(x, y).entity;
        if (entity !== null && entity.definition.key === "pasture")
            return true;
        return false;
    }
}
