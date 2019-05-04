import { Worker } from "./Worker";

export class WorkerState {
    protected readonly worker: Worker;
    protected runningFor: number = 0;

    private readonly _key: string;
    get key(): string {
        return this._key;
    }
    constructor(key: string, worker: Worker) {
        this.worker = worker;
        this._key = key;
    }

    public update(timePassed: number) {
        this.runningFor += timePassed;
    }

    // finishes the state immediately
    public finish() {
        this.runningFor = 0;
        this.update(this.getDuration());
    }

    public getDuration(): number {
        return Number.POSITIVE_INFINITY;
    }

    public isFinished(): boolean {
        return this.runningFor >= this.getDuration();
    }

    public isSuccesful(): boolean {
        return true;
    }

    public draw() {
    }
}
