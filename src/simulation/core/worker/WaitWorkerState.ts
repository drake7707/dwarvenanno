import { Worker } from "./Worker";
import { WorkerState } from "./WorkerState";

export class WaitWorkerState extends WorkerState {

    private readonly msToWait: number;
    constructor(key: string, worker: Worker, msToWait: number) {
        super(key, worker);
        this.msToWait = msToWait;
    }

    public getDuration(): number {
        return this.msToWait;
    }

    public isFinished(): boolean {
        return this.runningFor >= this.msToWait;
    }
}
