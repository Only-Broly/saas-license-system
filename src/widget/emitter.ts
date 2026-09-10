/**
 * Minimal, dependency-free typed event emitter used internally by the
 * playground core. Kept tiny on purpose to preserve bundle size.
 */
export class EventEmitter<EventMap extends object> {
  private listeners: {
    [K in keyof EventMap]?: Set<(payload: EventMap[K]) => void>;
  } = {};

  on<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): () => void {
    if (!this.listeners[event]) this.listeners[event] = new Set();
    this.listeners[event]!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: (payload: EventMap[K]) => void,
  ): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners[event]?.forEach((handler) => {
      try {
        handler(payload);
      } catch (err) {
        // Never let a host callback crash the widget.
        // eslint-disable-next-line no-console
        console.error("[live-code-playground] listener error:", err);
      }
    });
  }

  clear(): void {
    this.listeners = {};
  }
}
