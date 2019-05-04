import { Worker } from "./Worker";
import { WorkerState } from "./WorkerState";

export abstract class Behaviour {

    protected readonly worker: Worker;
    protected curState: WorkerState;

    constructor(public key: string, worker: Worker) {
        this.worker = worker;
        this.curState = new WorkerState("idle", this.worker);
    }

    public update(timePassed: number) {
        // old code, don't use update anymore to change states,
        // instead use future actions to schedule the state change
        // based on its duration
        /* if (this.curState.isFinished())
             this.curState = this.getNextState(this.curState);
*/
        this.curState.update(timePassed);
    }

    public onStateFinished() {
        this.curState.finish();
        const nextState = this.getNextState(this.curState);
        this.changeStateTo(nextState);
    }

    public changeStateTo(state: WorkerState) {
        this.curState = state;
        if (state.getDuration() !== Number.POSITIVE_INFINITY) {
            const ownerKey = this.worker.owner.definition.key + " " + this.worker.owner.id;
            const workerKey = this.worker.id;
            const name = ownerKey + ", worker " + workerKey + " " + state.key;
            this.worker.world.scheduler.scheduleEntityAction("WORKER_STATE_CHANGE_" + this.worker.id, this.worker.owner, name, () => this.onStateFinished(), state.getDuration());
        }
    }

    get executingState(): string {
        return this.curState.key;
    }

    public getNextState(curState: WorkerState): WorkerState {
        return curState;
    }

    public isWorking(): boolean {
        return false;
    }

    public draw() {
        this.curState.draw();
    }
}
