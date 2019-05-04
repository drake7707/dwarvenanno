import { IComparable } from "../../datastructs/IComparable";
import { Position } from "./Position";

export class AStarNode implements IComparable {
    public constructor(public parent: AStarNode, public position: Position, public cost: number) {
    }

    public compareTo(other: IComparable) {
        const otherNode: AStarNode = <AStarNode>other;
        return this.cost - otherNode.cost;
    }

    public getKey(): string {
        return this.position.toString();
    }
}
