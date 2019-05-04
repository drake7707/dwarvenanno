import { IMetadata } from "../metadata/IMetadata";
import { ProcessMetadata } from "../metadata/ProcessMetadata";
import { Size } from "../Size";
import { IInputStorageContainer } from "../storage/IInputStorageContainer";
import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { Storage } from "../storage/Storage";
import { StorageContainerDefinition } from "../storage/StorageContainerDefinition";
import { World } from "../World";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { FetchItemBuildingTileEntityDefinition } from "./FetchItemBuildingTileEntityDefinition";
import { ProcessResult } from "./ProcessResult";
import { TileEntity } from "./TileEntity";

export abstract class ProcessBuildingTileEntityDefinition extends FetchItemBuildingTileEntityDefinition {

    protected processPeriodicity: number = 1000;

    public inputStorageDefinition: StorageContainerDefinition;
    public outputStorageDefinition: StorageContainerDefinition;

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, itemToFetch: string, blocked: boolean = true, availableNrOfWorkers: number = 0, nrOfInputStorageSlots: number = 1, maxNrOfInputItems = 1, nrOfOutputStorageSlots: number = 1, maxNrOfOutputItems = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, [itemToFetch], blocked, availableNrOfWorkers);
        this.inputStorageDefinition = new StorageContainerDefinition(nrOfInputStorageSlots, maxNrOfInputItems);
        this.outputStorageDefinition = new StorageContainerDefinition(nrOfOutputStorageSlots, maxNrOfOutputItems);
    }

    public createMetadata(): IMetadata {
        return new ProcessMetadata(this.inputStorageDefinition, this.outputStorageDefinition);
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        const b = new BuildingTileEntity(this, world, x, y);
        for (const w of b.workers)
            w.color = "#FF0000";
        return b;
    }

    protected getTargetStorageForDropOff(entity: TileEntity): Storage {
        return entity.getMetadata<IInputStorageContainer>().inputStorage;
    }

    public initializeEntity(world: World, entity: TileEntity) {
        super.initializeEntity(world, entity);
        const metadata = entity.getMetadata<IOutputStorageContainer>();
        metadata.outputStorage.onStorageChanged = (incoming: boolean) => this.onOutputStorageChanged(incoming, world, <BuildingTileEntity>entity);
    }

    private scheduleProcess(world: World, entity: BuildingTileEntity) {
        if (!world.scheduler.isEntityActionScheduled("PROCESS", entity)) {
            // if not scheduled, schedule a process action
            const processAction = () => {
                const reschedule = this.onProcessAction(world, entity);
                if (reschedule) {
                    this.scheduleProcess(world, entity);
                }
            };
            world.scheduler.scheduleEntityAction("PROCESS", entity, "processing for " + entity.definition.key + " " + entity.id, processAction, this.processPeriodicity);
        }
    }
    public abstract getProcess(item: string, amount: number): ProcessResult;
    protected onTargetForDropOffStorageChanged(incoming: boolean, world: World, entity: TileEntity) {
        super.onTargetForDropOffStorageChanged(incoming, world, entity);
        if (incoming) {
            this.scheduleProcess(world, <BuildingTileEntity>entity);
        }
    }
    private onOutputStorageChanged(incoming: boolean, world: World, entity: BuildingTileEntity) {
        if (!incoming) { // things were removed, if there wasn't room to store, now maybe there is
            this.scheduleProcess(world, entity);
        }
    }

    protected onProcessAction(world: World, entity: BuildingTileEntity): boolean {
        const metadata = entity.getMetadata<ProcessMetadata>();
        let anySuccess: boolean = false;

        for (let i: number = 0; i < this.inputStorageDefinition.nrOfStorageSlots; i++) {
            const item = metadata.inputStorage.getItem(i);
            // todo only check once per item
            const result = this.getProcess(item, metadata.inputStorage.getTotalAmountOf(item));

            if (result.success) {
                let canAdd = true;
                for (let j: number = 0; j < result.resultItems.length && canAdd; j++) {
                    if (!metadata.outputStorage.canAdd(result.resultItems[j], result.resultAmounts[j]))
                        canAdd = false;
                }

                if (canAdd) {
                    metadata.inputStorage.remove(result.item, result.amountUsed);
                    for (let j: number = 0; j < result.resultItems.length; j++) {
                        metadata.outputStorage.add(result.resultItems[j], result.resultAmounts[j]);
                        world.scoring.onItemProcessed(result.resultItems[j], result.resultAmounts[j]);
                    }
                    anySuccess = true;
                }
            }
        }
        if (metadata.inputStorage.isEmpty || !anySuccess)
            return false;
        else
            return true;
    }
}
