import { IComparable } from "../../datastructs/IComparable";
import { IHeapItem } from "../../datastructs/IHeapItem";
import { TileEntity } from "./entity/TileEntity";

export class FutureAction implements IHeapItem {
    private static readonly actionCounter: number = 0;

    constructor(private readonly creationTime: number, private readonly key: string, public description: string, public action: () => void, public remainingTimeToFire: number, public entityContext: TileEntity) {
    }

    public getTimeToFire(): number {
        return this.creationTime + this.remainingTimeToFire;
    }

    public compareTo(other: IComparable): number {
        // this is the correct order, lower first
        return this.getTimeToFire() - (<FutureAction>other).getTimeToFire();
    }

    public getKey(): string {
        return this.key;
    }
}
