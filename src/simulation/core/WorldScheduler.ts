import { PriorityQueue } from "../../datastructs/PriorityQueue";
import { TileEntity } from "./entity/TileEntity";
import { FutureAction } from "./FutureAction";
import { World } from "./World";
import { WorldModule } from "./WorldModule";

export class WorldScheduler extends WorldModule {

    private readonly futureActions: PriorityQueue<FutureAction>;
    private _nrOfActionsProcessed: number = 0;

    get processedActionCount(): number { return this._nrOfActionsProcessed; }
    public currentTime: number = 0;

    constructor(world: World) {
        super(world);
        // queue actions based on the their fire time
        this.futureActions = new PriorityQueue<FutureAction>();
    }

    public getFutureActions(): FutureAction[] {
        const arr: FutureAction[] = [];
        const actions = this.futureActions.clone();
        while (actions.size > 0) {
            const action = actions.dequeue();
            arr.push(action);
        }
        return arr;
    }

    public scheduleWorldAction(key: string, description: string, act: () => void, remainingTimeToFire: number) {
        this.scheduleEntityAction(key, null, description, act, remainingTimeToFire);
    }

    public scheduleEntityAction(key: string, entityContext: TileEntity, description: string, act: () => void, remainingTimeToFire: number) {
        if (entityContext !== null) {
            let containsEntity: boolean = false;
            for (const e of this.world.entities) {
                if (entityContext.id === e.id) {
                    containsEntity = true;
                    break;
                }
            }
            if (!containsEntity) {
                const msg = `key=${key}, entity:${entityContext.definition.key}, id:${entityContext.id}`;
                throw new Error("scheduling action for entity that does not exist: " + msg);
            }
        }
        const action = new FutureAction(this.currentTime, WorldScheduler.getFutureActionKey(key, entityContext), description, act, remainingTimeToFire, entityContext);
        // console.log(action.getKey() + " scheduled");
        this.futureActions.enqueue(action);
    }

    public static getFutureActionKey(key: string, entity: TileEntity): string {
        if (entity === null)
            return key;
        else
            return entity.id + "_" + key;
    }

    public isEntityActionScheduled(key: string, entity: TileEntity) {
        return this.futureActions.contains(WorldScheduler.getFutureActionKey(key, entity));
    }

    public removeScheduledEntityActions(entity: TileEntity) {
        this.futureActions.removeWhere(a => a.entityContext !== null && a.entityContext.id === entity.id);
    }

    public update(curTime: number, timePassed: number) {
        for (const entity of this.world.entities) {
            entity.update(this.world, timePassed);
        }
        let stop = false;

        while (this.futureActions.size > 0 && !stop) {
            const action = this.futureActions.peek();
            if (curTime >= action.getTimeToFire()) {
                this.futureActions.dequeue();
                // time to fire
                this.currentTime = action.getTimeToFire(); // the time of the world is now the moment the action is fired

                // TODO remove this debug block
                if (action.entityContext !== null && action.entityContext.definition.key === "mediumhouse") {
                    let containsEntity: boolean = false;
                    for (const e of this.world.entities) {
                        if (action.entityContext.id === e.id) {
                            containsEntity = true;
                            break;
                        }
                    }
                    if (!containsEntity) {
                        const msg = `key=${action.getKey()}, entity:${action.entityContext.definition.key}, id:${action.entityContext.id}`;
                        console.log(msg);
                        throw new Error("executing action for entity that does not exist: " + msg);
                    }
                }
                // ------
                action.action();
                this._nrOfActionsProcessed++;
            } else
                stop = true;
        }
        this.currentTime = curTime;
    }
}
