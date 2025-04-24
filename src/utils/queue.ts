class Queue<T> {
  private items: (T | undefined)[] = [];
  private head: number = 0;
  private tail: number = 0;

  enqueue(item: T): void {
    this.items[this.tail++] = item;
  }

  dequeue(): T | null {
    if (this.isEmpty()) return null;

    const item = this.items[this.head];
    this.items[this.head++] = undefined;

    return item ?? null;
  }

  isEmpty(): boolean {
    return this.head === this.tail;
  }
}

export default Queue;
