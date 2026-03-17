/**
 * Data Structures for TaskFlow Pro
 */

// 1. Stack for Undo Feature
export class Stack<T> {
  private items: T[] = [];
  push(item: T) { this.items.push(item); }
  pop(): T | undefined { return this.items.pop(); }
  peek(): T | undefined { return this.items[this.items.length - 1]; }
  isEmpty() { return this.items.length === 0; }
  size() { return this.items.length; }
}

// 2. Priority Queue (Max Heap) for Task Priority
// Priority: High (3), Medium (2), Low (1)
export class PriorityQueue<T> {
  private heap: { priority: number; item: T }[] = [];

  push(item: T, priority: number) {
    this.heap.push({ priority, item });
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  isEmpty() { return this.heap.length === 0; }

  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].priority <= this.heap[parentIndex].priority) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown() {
    let index = 0;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let largest = index;

      if (left < this.heap.length && this.heap[left].priority > this.heap[largest].priority) largest = left;
      if (right < this.heap.length && this.heap[right].priority > this.heap[largest].priority) largest = right;
      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
      index = largest;
    }
  }
}

// 3. Min Heap for Due Dates
export class MinHeap<T> {
  private heap: { value: number; item: T }[] = [];

  push(item: T, value: number) {
    this.heap.push({ value, item });
    this.bubbleUp();
  }

  pop(): T | undefined {
    if (this.isEmpty()) return undefined;
    const top = this.heap[0].item;
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown();
    }
    return top;
  }

  isEmpty() { return this.heap.length === 0; }

  private bubbleUp() {
    let index = this.heap.length - 1;
    while (index > 0) {
      let parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index].value >= this.heap[parentIndex].value) break;
      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
      index = parentIndex;
    }
  }

  private bubbleDown() {
    let index = 0;
    while (true) {
      let left = 2 * index + 1;
      let right = 2 * index + 2;
      let smallest = index;

      if (left < this.heap.length && this.heap[left].value < this.heap[smallest].value) smallest = left;
      if (right < this.heap.length && this.heap[right].value < this.heap[smallest].value) smallest = right;
      if (smallest === index) break;

      [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
      index = smallest;
    }
  }
}

// 4. Inverted Index for Keyword Search
export class InvertedIndex<T> {
  private index: Map<string, Set<T>> = new Map();

  add(text: string, item: T) {
    const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    for (const word of words) {
      if (!this.index.has(word)) this.index.set(word, new Set());
      this.index.get(word)!.add(item);
    }
  }

  search(query: string): T[] {
    const words = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    if (words.length === 0) return [];
    
    let results: Set<T> | null = null;
    for (const word of words) {
      const matches = this.index.get(word);
      if (!matches) return [];
      if (results === null) {
        results = new Set(matches);
      } else {
        results = new Set([...results].filter(x => matches.has(x)));
      }
    }
    return results ? Array.from(results) : [];
  }

  clear() {
    this.index.clear();
  }
}
