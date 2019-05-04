import { Area } from "../Area";
import { Behaviour } from "./Behaviour";
import { IFetchItemBehaviourEvents } from "./IFetchItemBehaviourEvents";
import { MovingWorkerState } from "./MovingWorkerState";
import { WaitWorkerState } from "./WaitWorkerState";
import { Worker } from "./Worker";
import { WorkerState } from "./WorkerState";

export class FetchItemBehaviour extends Behaviour {

    private source: Area;
    private destination: Area;

    private _itemToFetch: string;
    public get itemToFetch(): string { return this._itemToFetch; }

    private lastToTargetMovingState: MovingWorkerState = null;

    constructor(key: string, worker: Worker, private readonly waitDurationOnGet: number, private readonly waitDurationOnDropoff: number, private readonly events: IFetchItemBehaviourEvents) {
        super(key, worker);
        this.events = events;
        this.waitDurationOnGet = waitDurationOnGet;
        this.waitDurationOnDropoff = waitDurationOnDropoff;
        this.curState = new WorkerState("idle", this.worker);
    }

    public fetch(source: Area, destination: Area, item: string) {
        this._itemToFetch = item;
        this.source = source;
        this.destination = destination;
        let state: WorkerState = new MovingWorkerState("toTarget", this.worker, source, destination);
        if (state.isFinished() && !state.isSuccesful()) {
            state = new WorkerState("idle", this.worker);
        }
        this.changeStateTo(state);
    }

    public changeStateTo(state: WorkerState) {
        super.changeStateTo(state);
        if (state.key === "idle")
            this.events.onWorkerIdle(this.worker);
        else if (state.key === "toTarget") {
            this.lastToTargetMovingState = <MovingWorkerState>state;
        }
    }

    public getNextState(curState: WorkerState): WorkerState {
        switch (curState.key) {
            case "toTarget":
                if (curState.isSuccesful()) {
                    const successful = this.events.onWorkerGetItem(this.worker, this.destination);
                    if (!successful)
                        return new WorkerState("idle", this.worker);
                    return new WaitWorkerState("getItem", this.worker, this.waitDurationOnGet);
                } else
                    return new WorkerState("idle", this.worker);

            case "getItem":
                /*  if(this.lastToTargetMovingState != null) {
                      // reuse the old route to go back
                      return MovingWorkerState.FromExistingMovingWorkerState("toHome", this.worker, this.destination, this.source, this.lastToTargetMovingState);
                  }*/
                return new MovingWorkerState("toHome", this.worker, this.destination, this.source);
            case "toHome":
                if (curState.isSuccesful()) {
                    const successful = this.events.onWorkerDropOffItem(this.worker);
                    if (!successful)
                        return new WorkerState("waitingForDropoff", this.worker);
                    return new WaitWorkerState("dropoffItem", this.worker, this.waitDurationOnDropoff);
                } else // well dammit, I'm stuck
                    return new WorkerState("idle", this.worker);
            case "waitingForDropoff":
                // no auto change, it has to be signaled to get out of this
                break;
            case "dropoffItem":
                return new WorkerState("idle", this.worker);
        }
        return curState;
    }

    public becomeIdle() {
        this.changeStateTo(new WorkerState("idle", this.worker));
    }

    public isWorking(): boolean {
        return this.executingState !== "idle" && this.executingState !== "waitingForDropoff";
    }
}
