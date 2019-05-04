import { Heap } from "./Heap";
import { IHeapItem } from "./IHeapItem";

export class PriorityQueue<T extends IHeapItem> {
    private heap: Heap<T> = new Heap<T>();
    public enqueue(obj: T): void {
        this.heap.add(obj);
    }
    public peek(): T {
        return this.heap.peek();
    }
    public updatePriority(key: T) {
        this.heap.checkHeapRequirement(key);
    }
    public get(key: string): T {
        return this.heap.at(key);
    }
    get size(): number {
        return this.heap.size();
    }
    public dequeue(): T {
        return this.heap.shift();
    }
    public dump() {
        this.heap.dump();
    }
    public contains(key: string) {
        return this.heap.contains(key);
    }

    public removeWhere(predicate: (el: T) => boolean) {
        this.heap.removeWhere(predicate);
    }
    public clone(): PriorityQueue<T> {
        const p = new PriorityQueue<T>();
        p.heap = this.heap.clone();
        return p;
    }
}
