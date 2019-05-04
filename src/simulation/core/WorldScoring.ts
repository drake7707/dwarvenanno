import { BuildingTileEntity } from "./entity/BuildingTileEntity";
import { BuildingTileEntityDefinition } from "./entity/BuildingTileEntityDefinition";
import { ProcessBuildingTileEntityDefinition } from "./entity/ProcessBuildingTileEntityDefinition";
import { ProductionBuildingTileEntityDefinition } from "./entity/ProductionBuildingTileEntityDefinition";
import { ITaxProfit } from "./ITaxProfit";
import { World } from "./World";
import { WorldModule } from "./WorldModule";

export class WorldScoring extends WorldModule {

    public money: number;
    public nrOfItemsProduced: number;
    public nrOfItemsProcessed: number;
    private readonly payDayEvery: number = 1000;

    constructor(world: World) {
        super(world);
        this.money = 0;
        this.nrOfItemsProduced = 0;
        this.nrOfItemsProcessed = 0;
        this.world.scheduler.scheduleWorldAction("PAYDAY", "Pay day", () => this.onPayDay(), this.payDayEvery);
        this.world.scheduler.scheduleWorldAction("COUNT_IDLE_WORKERS", "Count the nr of workers being idle", () => this.countIdleWorkers(), 1000);
    }

    public onItemProduced(item: string, amount: number) {
        this.nrOfItemsProduced += amount;
    }

    public onItemProcessed(item: string, amount: number) {
        this.nrOfItemsProcessed += amount;
    }

    public lastIncome: number = 0;
    public lastExpense: number = 0;
    private onPayDay() {
        this.lastIncome = 0;
        this.lastExpense = 0;
        for (const e of this.world.entities) {
            if (e.definition instanceof BuildingTileEntityDefinition) {
                this.money -= e.definition.upkeepCost / 60;
                this.lastExpense += e.definition.upkeepCost / 60;
            }

            if ((<ITaxProfit><any>e.definition).taxAmount) {
                this.money += (<ITaxProfit><any>e.definition).taxAmount / 60;
                this.lastIncome += (<ITaxProfit><any>e.definition).taxAmount / 60;
            }
        }
        this.world.scheduler.scheduleWorldAction("PAYDAY", "Pay day", () => this.onPayDay(), this.payDayEvery);
    }

    public workerCount: number = 0;
    public idleWorkerCount: number = 0;

    private countIdleWorkers() {
        this.workerCount = 0;
        for (const e of this.world.entities) {
            if (e.definition instanceof ProductionBuildingTileEntityDefinition
                || e.definition instanceof ProcessBuildingTileEntityDefinition) {
                for (const w of (<BuildingTileEntity>e).workers) {
                    if (!w.behaviour.isWorking()) {
                        this.idleWorkerCount++;
                    }
                    this.workerCount++;
                }
            }
        }
        this.world.scheduler.scheduleWorldAction("COUNT_IDLE_WORKERS", "Count the nr of workers being idle", () => this.countIdleWorkers(), 1000);
    }
}
