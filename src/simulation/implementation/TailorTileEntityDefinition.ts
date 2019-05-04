import { ProcessBuildingTileEntityDefinition } from "../core/entity/ProcessBuildingTileEntityDefinition";
import { ProcessResult } from "../core/entity/ProcessResult";
import { Size } from "../core/Size";

export class TailorTileEntityDefinition extends ProcessBuildingTileEntityDefinition {

    constructor() {
        super("tailor", new Size(2, 2), 32, 2, "leather", true, 1, 1, 40, 1, 40);
        this.processPeriodicity = 5000;
        this.scanTargetPeriodicity = 5000;
        this.upkeepCost = 60;
    }

    public getProcess(item: string, amount: number): ProcessResult {
        const success = item === "leather" && amount >= 2;
        return new ProcessResult(success, "leather", 2, ["clothes"], [1]);
    }
}
