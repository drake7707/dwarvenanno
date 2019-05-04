import { Area } from "../core/Area";
import { ProductionBuildingTileEntityDefinition } from "../core/entity/ProductionBuildingTileEntityDefinition";
import { Size } from "../core/Size";
import { TileModifierFlags } from "../core/TileModifierFlags";
import { Worker } from "../core/worker/Worker";
import { World } from "../core/World";

export class WoodCutterTileEntityDefinition extends ProductionBuildingTileEntityDefinition {
    private readonly saplingsGrowBackToTreesIn: number = 300000;
    public constructor() {
        super("woodcutter", new Size(2, 2), 0, 2, ["wood"], true, 3, 3, 3);
        this.scanOnUniqueEntities = false; // we're using tiles anyway
        this.upkeepCost = 10;
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        // override super is target, check for tiles instead
        const defIdx = world.getTile(x, y).definitionIndex;
        return (world.getTileDefinition(defIdx).flags & TileModifierFlags.Woodcuttable) === TileModifierFlags.Woodcuttable;
    }

    public onWorkerGetItem(worker: Worker, dest: Area): boolean {
        const defIdx = worker.world.getTile(dest.position.x, dest.position.y).definitionIndex;
        if ((worker.world.getTileDefinition(defIdx).flags & TileModifierFlags.Woodcuttable) !== TileModifierFlags.Woodcuttable)
            return false;

        // on get item
        const addStorageResult = worker.outputStorage.add("wood", 1);
        if (addStorageResult.actualAmount === 0)
            return false;

        // make the tile a sapling
        worker.world.setTileDefinition(dest.position.x, dest.position.y, "sapling");

        // make the sapling grow after a while
        worker.world.scheduler.scheduleWorldAction("SAPLING_REGROW_AT_" + dest.position.x + "_" + dest.position.y, "regrow sapling at " + dest.position.x + "," + dest.position.y, () => {
            if (worker.world.isTileOfDefiniton(dest.position.x, dest.position.y, "sapling"))
                worker.world.setTileDefinition(dest.position.x, dest.position.y, "tree");
        }, this.saplingsGrowBackToTreesIn);

        return true;
    }
}
