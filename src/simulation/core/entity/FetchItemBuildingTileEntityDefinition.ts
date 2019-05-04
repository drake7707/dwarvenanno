import { Map } from "../../../datastructs/Map";
import { DEBUG } from "../../../globals";
import { Area } from "../Area";
import { CachedTargetsMetadata } from "../metadata/CachedTargetsMetadata";
import { ICachedTargetsMetadata } from "../metadata/ICachedTargetsMetadata";
import { IMetadata } from "../metadata/IMetadata";
import { Size } from "../Size";
import { IOutputStorageContainer } from "../storage/IOutputStorageContainer";
import { FetchItemBehaviour } from "../worker/FetchItemBehaviour";
import { IFetchItemBehaviourEvents } from "../worker/IFetchItemBehaviourEvents";
import { Worker } from "../worker/Worker";
import { World } from "../World";
import { Storage } from "./../storage/Storage";
import { BuildingTileEntity } from "./BuildingTileEntity";
import { BuildingTileEntityDefinition } from "./BuildingTileEntityDefinition";
import { CanFetchState } from "./CanFetchState";
import { TileEntity } from "./TileEntity";

export abstract class FetchItemBuildingTileEntityDefinition extends BuildingTileEntityDefinition implements IFetchItemBehaviourEvents {
    public radius: number = 8;
    protected scanTargetPeriodicity: number = 60000;
    protected timeToRetrieveItem: number = 1000;
    protected timeToDeliverItem: number = 1000;
    protected itemsToFetch: string[];
    protected treshholdForItemsToFetch: Map<number>;
    protected scanOnUniqueEntities: boolean = true;
    /**
     * If true ensures that 2 workers will never fetch the same item at the same time,
     * even from different sources.
     */
    protected limitItemsToFetchToSingleWorker: boolean = false;

    public constructor(key: string, size: Size, sourceTilesetX: number, sourceTilesetY: number, itemsToFetch: string[], blocked: boolean = true, availableNrOfWorkers: number = 0, nrOfStorageSlots: number = 1, maxNrOfItems = 1) {
        super(key, size, sourceTilesetX, sourceTilesetY, blocked, availableNrOfWorkers);
        this.itemsToFetch = itemsToFetch;
        this.treshholdForItemsToFetch = new Map<number>();
        // by default don't have any treshold and fetch as much as possible
        for (const item of itemsToFetch)
            this.treshholdForItemsToFetch.put(item, Number.MAX_VALUE);
    }

    public createInstance(world: World, x: number, y: number): TileEntity {
        return new BuildingTileEntity(this, world, x, y);
    }

    public createMetadata(): IMetadata {
        return new CachedTargetsMetadata();
    }

    public initializeEntity(world: World, entity: TileEntity) {
        const metadata = entity.getMetadata<ICachedTargetsMetadata>();
        const entityWorkers = (<BuildingTileEntity>entity).workers;
        for (const entityWorker of entityWorkers) {
            // switch to fetch wood behaviour if idle worker
            if (typeof entityWorker.behaviour === "undefined") {
                entityWorker.behaviour = new FetchItemBehaviour("fetchProductionItem", entityWorker, this.timeToRetrieveItem, this.timeToDeliverItem, this);
            }
            this.onWorkerIdle(entityWorker);
        }
        this.getTargetStorageForDropOff(entity).storageChanged = (incoming: boolean) => {
            this.onTargetForDropOffStorageChanged(incoming, world, entity);
        };
        const scanAction = () => {
            for (const item of this.itemsToFetch) {
                const targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, item);
                if (targetsOfItem.length === 0) {
                    // it's been a while, check for targets around entity
                    this.scanForTargetAroundEntity(world, entity, item, metadata);
                }
            }
            world.scheduler.scheduleEntityAction("SCAN_TARGETS", entity, "scan for targets for " + entity.definition.key + " " + entity.id, scanAction, this.scanTargetPeriodicity);
        };
        scanAction();
    }

    public destroyEntity(world: World, entity: TileEntity) {
        // clean up the event handler of storage changed for this entity
        this.getTargetStorageForDropOff(entity).storageChanged = null;
    }

    protected onTargetForDropOffStorageChanged(incoming: boolean, world: World, entity: TileEntity) {
        if (!incoming) {
            for (const worker of (<BuildingTileEntity>entity).workers) {
                if (worker.behaviour.executingState === "waitingForDropoff") {
                    const result = this.onWorkerDropOffItem(worker);
                    if (result) {
                        if (DEBUG)
                            console.log(entity.definition.key + " - " + entity.id + ", worker " + worker.id + " was able to drop off after storage change");
                        (<FetchItemBehaviour>worker.behaviour).becomeIdle();
                    }
                }
            }
        }
    }

    private static getTargetsOfItem(metadata: ICachedTargetsMetadata, item: string): Area[] {
        let targetsOfItem: Area[];
        if (!metadata.targetsInRadius.containsKey(item)) {
            targetsOfItem = [];
            metadata.targetsInRadius.put(item, targetsOfItem);
        } else
            targetsOfItem = metadata.targetsInRadius.get(item);
        return targetsOfItem;
    }

    private scanForTargetAroundEntity(world: World, entity: TileEntity, item: string, metadata: ICachedTargetsMetadata) {
        // console.log("scanning");
        // maybe add the cuttable trees in a priority queue instead, so the closest ones are always chosen, if you remove the length == 0 constraint that is
        const entitiesVisitedPerItem = new Map<Map<boolean>>();
        for (const item of this.itemsToFetch) {
            entitiesVisitedPerItem.put(item, new Map<boolean>());
        }

        world.getTilesAround(entity.getArea(), this.radius, (x, y) => {
            // for (let item of this.itemsToFetch) {
            if (this.isTarget(world, x, y, item)) {
                const targetsOfItem: Area[] = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, item);
                if (!this.scanOnUniqueEntities)
                    targetsOfItem.push(Area.create(x, y, 1, 1));
                else {
                    // check if the entity wasn't listed before
                    const e = world.getTile(x, y).entity;
                    if (e === null)
                        targetsOfItem.push(Area.create(x, y, 1, 1));
                    else {
                        if (!entitiesVisitedPerItem.get(item).containsKey(e.id + "")) {
                            targetsOfItem.push(e.getArea());
                            entitiesVisitedPerItem.get(item).put(e.id + "", true);
                        }
                    }
                }
            }
            //  }
            return true; // continue
        });
        // console.log("scanned for targets, " + metadata.targetsInRadius.length + " targets found");
    }

    protected isTarget(world: World, x: number, y: number, item: string): boolean {
        const entity = world.getTile(x, y).entity;
        if (entity !== null) {
            const oContainer = entity.getMetadata<IOutputStorageContainer>();
            if (typeof oContainer.outputStorage !== "undefined" && oContainer.outputStorage.getTotalAmountOf(item) > 0) {
                return true;
            }

        }
        return false;
    }

    public onWorkerGetItem(worker: Worker, dest: Area): boolean {
        const entity = worker.world.getTile(dest.position.x, dest.position.y).entity;
        if (entity !== null) {
            const oContainer = entity.getMetadata<IOutputStorageContainer>();
            if (oContainer.outputStorage) {
                const itemToFetch = (<FetchItemBehaviour>worker.behaviour).itemToFetch;
                // check the remaining amount to bring back based on the treshold
                // obviously it's still limited to the amount the worker can carry
                // but that's handled in the transferItemFrom
                const curAmount = this.getTargetStorageForDropOff(worker.owner).getTotalAmountOf(itemToFetch);
                const treshold = this.treshholdForItemsToFetch.get(itemToFetch);
                const amount = treshold - curAmount;
                if (amount <= 0) {
                    // ring ring, yes hello worker? Yeah i'm full now, don't bring me anything
                    return true;
                }
                worker.outputStorage.transferItemFrom(oContainer.outputStorage, itemToFetch, amount);
                return true;
            }
        }
        return false;
    }

    protected canFetch(worker: Worker): boolean {
        for (const item of this.itemsToFetch) {
            if (this.canFetchItem(worker, item) === CanFetchState.CanFetch)
                return true;
        }
        return false;
    }

    protected canFetchItem(worker: Worker, item: string): CanFetchState {
        const storageForDropOff = this.getTargetStorageForDropOff(worker.owner);
        if (storageForDropOff.getTotalAmountOf(item) >= this.treshholdForItemsToFetch.get(item)) {
            if (DEBUG)
                console.log("item " + item + " can't be fetched because storage exceeds treshold " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            return CanFetchState.TreshholdReached;
        }
        if (!worker.outputStorage.canAdd(item, 1)) {
            if (DEBUG)
                console.log("item " + item + " can't be fetched because the worker can't store it " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            return CanFetchState.WorkerCantStoreItem;
        }
        const targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(worker.owner.getMetadata<ICachedTargetsMetadata>(), item);
        if (targetsOfItem.length === 0) {
            if (DEBUG)
                console.log("item " + item + " can't be fetched because there are no targets where it can be fetched from " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            return CanFetchState.NoTargetsInRange;
        }
        if (DEBUG)
            console.log("item " + item + " can be fetched " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
        return CanFetchState.CanFetch;
    }
    protected canDropOffItem(worker: Worker): boolean {
        // if holding item To Fetch
        for (const item of this.itemsToFetch) {
            if (worker.outputStorage.getItem(0) === item)
                return true;
        }
        return false;
    }
    protected abstract getTargetStorageForDropOff(entity: TileEntity): Storage;

    public onWorkerDropOffItem(worker: Worker): boolean {
        const item = worker.outputStorage.getItem(0);
        const amount = worker.outputStorage.getAmount(0);

        if (amount === 0) // came back empty handed
            return true;

        if (!this.canDropOffItem(worker)) {
            console.log("item " + worker.outputStorage.getItem(0) + " could not be dropped off for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            return false;
        }

        const targetStorage = this.getTargetStorageForDropOff(worker.owner);
        const amountTransferred = targetStorage.transferItemFrom(worker.outputStorage, item, amount);

        if (amountTransferred > 0)
            this.onItemDroppedOff(worker, item, amountTransferred);

            // check if not able to drop it off completely
        if (amountTransferred < amount || amountTransferred === 0)
            return false;
        return true;
    }

    protected onItemDroppedOff(worker: Worker, item: string, amount: number) {
        // do nothing by default
    }

    public onWorkerIdle(worker: Worker) {
        // oi mate, work wot
        if (this.canFetch(worker)) {
            const metadata = worker.owner.getMetadata<ICachedTargetsMetadata>();
            const itemMostNeeded = this.getItemMostNeeded(worker);
            const targetsOfItem = FetchItemBuildingTileEntityDefinition.getTargetsOfItem(metadata, itemMostNeeded);
            if (DEBUG)
                console.log("item most needed is " + itemMostNeeded + " for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id);
            if (targetsOfItem.length > 0) {
                const target = targetsOfItem.shift();
                // check if still a valid target
                if (this.isTarget(worker.world, target.position.x, target.position.y, itemMostNeeded)) {
                    const source: Area = worker.owner.getArea();
                    (<FetchItemBehaviour>worker.behaviour).fetch(source, target, itemMostNeeded);
                }
            }
        }
        if (worker.behaviour.executingState === "idle" && !worker.world.scheduler.isEntityActionScheduled("CHECK_IDLE_" + worker.id, worker.owner))
            worker.world.scheduler.scheduleEntityAction("CHECK_IDLE_" + worker.id, worker.owner, "recheck idle status for " + worker.owner.definition.key + " " + worker.owner.id + " - worker " + worker.id, () => this.onWorkerIdle(worker), 1000);
    }

    protected getItemMostNeeded(worker: Worker): string {
        const storage: Storage = this.getTargetStorageForDropOff(worker.owner);
        let minItem: string = "";
        let minAmount: number = Number.MAX_VALUE;
        for (const item of this.itemsToFetch) {
            let isAlreadyFetching: boolean = false;
            if (this.limitItemsToFetchToSingleWorker) {
                for (const w of worker.owner.workers) {
                    if (w !== worker && w.behaviour instanceof FetchItemBehaviour && (w.behaviour).itemToFetch === item) {
                        isAlreadyFetching = true;
                        break;
                    }
                }
            }
            if (!isAlreadyFetching && this.canFetchItem(worker, item) == CanFetchState.CanFetch) {
                const amountOfItem = storage.getTotalAmountOf(item);
                const tresholdOfItem = this.treshholdForItemsToFetch.get(item);
                const percentage = amountOfItem / tresholdOfItem;
                if (minAmount > percentage) {
                    minItem = item;
                    minAmount = percentage;
                }
            }
        }
        return minItem;
    }
}
