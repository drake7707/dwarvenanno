import { Area } from "../Area";
import { Worker } from "./Worker";

export interface IFetchItemBehaviourEvents {
    onWorkerGetItem(worker: Worker, dest: Area): boolean;
    onWorkerDropOffItem(worker: Worker): boolean;
    onWorkerIdle(worker: Worker): void;
}
