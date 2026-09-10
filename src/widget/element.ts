import { PlaygroundCore } from "./core";
import type {
  LanguageKey,
  PlaygroundCode,
  PlaygroundConfig,
  PlaygroundEventMap,
  PlaygroundEventName,
  ThemeName,
} from "./types";

export const DEFAULT_TAG_NAME = "live-code-playground";

const BRIDGED_EVENTS: PlaygroundEventName[] = [
  "ready",
  "change",
  "run",
  "reset",
  "error",
  "console",
];

/**
 * `<live-code-playground>` — a framework-agnostic custom element that hosts
 * a `PlaygroundCore` instance inside a Shadow DOM for full style isolation.
 *
 * Two ways to configure it:
 *  1. Imperatively: `el.configure({...})` (used internally by `createPlayground`).
 *  2. Declaratively: `<live-code-playground config='{"code": {...}}'></live-code-playground>`.
 */
export class LiveCodePlaygroundElement extends HTMLElement {
  private core: PlaygroundCore | null = null;
  private mountPoint: HTMLDivElement;
  private pendingConfig: PlaygroundConfig | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    this.mountPoint = document.createElement("div");
    shadow.appendChild(this.mountPoint);
  }

  connectedCallback(): void {
    if (this.core) return;
    if (this.pendingConfig) {
      this.initialize(this.pendingConfig);
      return;
    }
    const attrConfig = this.readConfigAttribute();
    if (attrConfig) this.initialize(attrConfig);
  }

  disconnectedCallback(): void {
    this.destroy();
  }

  private readConfigAttribute(): PlaygroundConfig | null {
    const raw = this.getAttribute("config");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PlaygroundConfig;
    } catch {
      // eslint-disable-next-line no-console
      console.error("[live-code-playground] invalid `config` attribute JSON");
      return null;
    }
  }

  /** Programmatically (re)configure the widget. Tears down any previous instance. */
  configure(config: PlaygroundConfig): void {
    if (!this.isConnected) {
      this.pendingConfig = config;
      return;
    }
    this.initialize(config);
  }

  private initialize(config: PlaygroundConfig): void {
    if (this.core) {
      this.core.destroy();
      this.core = null;
    }
    this.core = new PlaygroundCore(this.mountPoint, config);
    BRIDGED_EVENTS.forEach((evt) => {
      this.core!.on(evt, (detail) => {
        this.dispatchEvent(
          new CustomEvent(`lcp-${evt}`, {
            detail,
            bubbles: true,
            composed: true,
          }),
        );
      });
    });
  }

  // ---- Mirrors of the public PlaygroundInstance API -----------------
  run(): void {
    this.core?.run();
  }

  reset(): void {
    this.core?.reset();
  }

  getCode(): Record<LanguageKey, string> | undefined {
    return this.core?.getCode();
  }

  setCode(code: PlaygroundCode, options?: { run?: boolean }): void {
    this.core?.setCode(code, options);
  }

  setTheme(theme: ThemeName): void {
    this.core?.setTheme(theme);
  }

  onPlaygroundEvent<K extends keyof PlaygroundEventMap>(
    event: K,
    handler: (payload: PlaygroundEventMap[K]) => void,
  ): () => void {
    if (!this.core) return () => {};
    return this.core.on(event, handler);
  }

  offPlaygroundEvent<K extends keyof PlaygroundEventMap>(
    event: K,
    handler: (payload: PlaygroundEventMap[K]) => void,
  ): void {
    this.core?.off(event, handler);
  }

  destroy(): void {
    this.core?.destroy();
    this.core = null;
  }
}

export function registerLiveCodePlayground(tagName: string = DEFAULT_TAG_NAME): void {
  if (typeof window === "undefined" || typeof customElements === "undefined") return;
  if (!customElements.get(tagName)) {
    customElements.define(tagName, LiveCodePlaygroundElement);
  }
}
