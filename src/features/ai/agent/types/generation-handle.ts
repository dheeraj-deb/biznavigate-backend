// Non-voice adaptation of agents-js SpeechHandle lifecycle pattern.
// Tracks one in-flight LLM generation per conversation; supports cancellation
// so that a new message can abort a slow in-progress graph.invoke().
export class GenerationHandle {
  readonly id: string;
  private _cancelled = false;
  private _done = false;
  private readonly abortController = new AbortController();
  private readonly doneCallbacks = new Set<() => void>();

  constructor(id: string) {
    this.id = id;
  }

  get cancelled(): boolean {
    return this._cancelled;
  }

  get done(): boolean {
    return this._done;
  }

  get signal(): AbortSignal {
    return this.abortController.signal;
  }

  cancel(): void {
    if (this._done) return;
    this._cancelled = true;
    this.abortController.abort();
    this._markDone();
  }

  _markDone(): void {
    if (this._done) return;
    this._done = true;
    for (const cb of this.doneCallbacks) cb();
    this.doneCallbacks.clear();
  }

  onDone(cb: () => void): void {
    if (this._done) {
      queueMicrotask(cb);
      return;
    }
    this.doneCallbacks.add(cb);
  }
}
