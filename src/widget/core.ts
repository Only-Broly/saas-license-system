import { EventEmitter } from "./emitter";
import { buildPreviewDocument } from "./sandbox";
import { WIDGET_STYLES } from "./styles";
import type {
  LanguageKey,
  PlaygroundCode,
  PlaygroundColors,
  PlaygroundConfig,
  PlaygroundEventMap,
  ThemeName,
} from "./types";

const DEFAULT_LANGUAGES: LanguageKey[] = ["html", "css", "javascript"];

const LANGUAGE_LABELS: Record<LanguageKey, string> = {
  html: "HTML",
  css: "CSS",
  javascript: "JS",
};

const THEME_PRESETS: Record<ThemeName, Required<PlaygroundColors>> = {
  dark: {
    accent: "#6366f1",
    background: "#0f1115",
    surface: "#171a21",
    border: "rgba(255, 255, 255, 0.12)",
    text: "#e7e9ee",
    muted: "#8b93a1",
    radius: "10px",
  },
  light: {
    accent: "#6366f1",
    background: "#ffffff",
    surface: "#f4f5f7",
    border: "rgba(15, 17, 21, 0.12)",
    text: "#14161a",
    muted: "#5b6370",
    radius: "10px",
  },
};

let uid = 0;
function nextId(prefix: string): string {
  uid += 1;
  return `${prefix}-${Date.now().toString(36)}-${uid}`;
}

function safeRandomId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return nextId("lcp");
}

interface NormalizedConfig {
  languages: LanguageKey[];
  activeLanguage: LanguageKey;
  theme: ThemeName;
  colors: PlaygroundColors;
  fontSize: number;
  readOnly: boolean;
  autoRun: boolean;
  debounce: number;
  previewVisible: boolean;
  showRun: boolean;
  showReset: boolean;
  showConsole: boolean;
  persistenceEnabled: boolean;
  persistenceKey: string | null;
  height: string;
}

function normalize(config: PlaygroundConfig): NormalizedConfig {
  const languages =
    config.languages && config.languages.length > 0
      ? config.languages.filter((l) => DEFAULT_LANGUAGES.includes(l))
      : DEFAULT_LANGUAGES;

  const activeLanguage =
    config.activeLanguage && languages.includes(config.activeLanguage)
      ? config.activeLanguage
      : languages[0];

  const height =
    typeof config.height === "number" ? `${config.height}px` : config.height || "480px";

  return {
    languages,
    activeLanguage,
    theme: config.theme === "light" ? "light" : "dark",
    colors: config.colors || {},
    fontSize: config.editor?.fontSize ?? 14,
    readOnly: config.editor?.readOnly ?? false,
    autoRun: config.preview?.autoRun ?? true,
    debounce: config.preview?.debounce ?? 400,
    previewVisible: config.preview?.visible ?? true,
    showRun: config.controls?.run ?? true,
    showReset: config.controls?.reset ?? true,
    showConsole: config.controls?.console ?? true,
    persistenceEnabled: config.persistence?.enabled ?? false,
    persistenceKey: config.persistence?.key ?? null,
    height,
  };
}

const DEFAULT_STARTER: Record<LanguageKey, string> = {
  html: "<h1>Hello world</h1>",
  css: "h1 {\n  color: #6366f1;\n  font-family: sans-serif;\n}",
  javascript: "console.log('Hello from the playground!');",
};

/**
 * PlaygroundCore owns ALL playground behaviour: editors, tabs, run/reset,
 * persistence, the sandboxed preview and the console panel. It is rendered
 * into any container element it is given (in practice, a ShadowRoot's inner
 * div) and knows nothing about React, Web Components, or the host page.
 */
export class PlaygroundCore {
  private container: HTMLElement;
  private cfg: NormalizedConfig;
  private emitter = new EventEmitter<PlaygroundEventMap>();
  private initialCode: Record<LanguageKey, string>;
  private code: Record<LanguageKey, string>;
  private activeLanguage: LanguageKey;
  private destroyed = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private storageKey: string | null = null;

  private root!: HTMLDivElement;
  private tabsEl!: HTMLDivElement;
  private editorWrap!: HTMLDivElement;
  private editors = new Map<LanguageKey, HTMLTextAreaElement>();
  private tabs = new Map<LanguageKey, HTMLButtonElement>();
  private runBtn!: HTMLButtonElement;
  private resetBtn!: HTMLButtonElement;
  private statusEl!: HTMLSpanElement;
  private consoleBody!: HTMLDivElement;
  private previewPanel!: HTMLDivElement;
  private iframe!: HTMLIFrameElement;

  private onMessage = (event: MessageEvent) => {
    if (!this.iframe || event.source !== this.iframe.contentWindow) return;
    const data = event.data;
    if (!data || typeof data !== "object" || !data.__lcp) return;
    if (data.type === "console") {
      this.appendConsoleLine(data.payload);
    } else if (data.type === "error") {
      this.appendConsoleLine({
        level: "error",
        args: [data.payload?.message || "Runtime error"],
        timestamp: Date.now(),
      });
      this.emitter.emit("error", {
        message: data.payload?.message || "Runtime error",
        stack: data.payload?.stack,
        source: "runtime",
      });
    }
  };

  constructor(container: HTMLElement, config: PlaygroundConfig) {
    this.container = container;
    this.cfg = normalize(config);

    this.initialCode = { ...DEFAULT_STARTER, ...(config.code || {}) } as Record<
      LanguageKey,
      string
    >;
    this.code = { ...this.initialCode };
    this.activeLanguage = this.cfg.activeLanguage;

    if (this.cfg.persistenceEnabled) {
      this.storageKey = `lcp:${this.cfg.persistenceKey || safeRandomId()}`;
      this.loadPersisted();
    }

    this.render();
    this.applyColors(this.cfg.colors);
    window.addEventListener("message", this.onMessage);

    if (this.cfg.autoRun) {
      this.run();
    }

    // Emit `ready` asynchronously so host listeners attached right after
    // construction never miss the event.
    Promise.resolve().then(() => {
      if (!this.destroyed) this.emitter.emit("ready", { code: this.getCode() });
    });
  }

  // ---------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------

  private render(): void {
    this.container.innerHTML = "";

    const style = document.createElement("style");
    style.textContent = WIDGET_STYLES;
    this.container.appendChild(style);

    this.root = document.createElement("div");
    this.root.className = "lcp-root";
    this.root.dataset.theme = this.cfg.theme;
    this.root.style.height = this.cfg.height;
    if (!this.cfg.previewVisible) this.root.dataset.previewHidden = "true";

    const editorPanel = document.createElement("div");
    editorPanel.className = "lcp-panel lcp-editor-panel";

    this.tabsEl = document.createElement("div");
    this.tabsEl.className = "lcp-tabs";
    this.tabsEl.setAttribute("role", "tablist");
    this.tabsEl.setAttribute("aria-label", "Playground languages");

    this.cfg.languages.forEach((lang) => {
      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "lcp-tab";
      tab.textContent = LANGUAGE_LABELS[lang];
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", String(lang === this.activeLanguage));
      tab.addEventListener("click", () => this.selectLanguage(lang));
      this.tabsEl.appendChild(tab);
      this.tabs.set(lang, tab);
    });

    const toolbar = document.createElement("div");
    toolbar.className = "lcp-toolbar";

    const actions = document.createElement("div");
    actions.className = "lcp-toolbar-actions";

    this.runBtn = document.createElement("button");
    this.runBtn.type = "button";
    this.runBtn.className = "lcp-btn lcp-btn-run";
    this.runBtn.textContent = "▶ Run";
    this.runBtn.style.display = this.cfg.showRun ? "" : "none";
    this.runBtn.addEventListener("click", () => this.run());

    this.resetBtn = document.createElement("button");
    this.resetBtn.type = "button";
    this.resetBtn.className = "lcp-btn lcp-btn-reset";
    this.resetBtn.textContent = "↺ Reset";
    this.resetBtn.style.display = this.cfg.showReset ? "" : "none";
    this.resetBtn.addEventListener("click", () => this.reset());

    actions.appendChild(this.runBtn);
    actions.appendChild(this.resetBtn);

    this.statusEl = document.createElement("span");
    this.statusEl.className = "lcp-status";
    this.statusEl.textContent = this.cfg.readOnly ? "Read-only" : "";

    toolbar.appendChild(actions);
    toolbar.appendChild(this.statusEl);

    this.editorWrap = document.createElement("div");
    this.editorWrap.className = "lcp-editor-wrap";

    this.cfg.languages.forEach((lang) => {
      const textarea = document.createElement("textarea");
      textarea.className = "lcp-editor";
      textarea.spellcheck = false;
      textarea.setAttribute("aria-label", `${LANGUAGE_LABELS[lang]} code editor`);
      textarea.value = this.code[lang] ?? "";
      textarea.style.fontSize = `${this.cfg.fontSize}px`;
      textarea.disabled = this.cfg.readOnly;
      textarea.dataset.active = String(lang === this.activeLanguage);
      textarea.addEventListener("input", () => this.handleInput(lang, textarea.value));
      textarea.addEventListener("keydown", (e) => this.handleEditorKeydown(e, textarea));
      this.editorWrap.appendChild(textarea);
      this.editors.set(lang, textarea);
    });

    editorPanel.appendChild(this.tabsEl);
    editorPanel.appendChild(toolbar);
    editorPanel.appendChild(this.editorWrap);

    if (this.cfg.showConsole) {
      const consolePanel = document.createElement("div");
      consolePanel.className = "lcp-console";

      const header = document.createElement("div");
      header.className = "lcp-console-header";
      const title = document.createElement("span");
      title.textContent = "Console";
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "lcp-console-clear";
      clearBtn.textContent = "Clear";
      clearBtn.addEventListener("click", () => this.clearConsole());
      header.appendChild(title);
      header.appendChild(clearBtn);

      this.consoleBody = document.createElement("div");
      this.consoleBody.className = "lcp-console-body";
      this.renderEmptyConsole();

      consolePanel.appendChild(header);
      consolePanel.appendChild(this.consoleBody);
      editorPanel.appendChild(consolePanel);
    }

    this.root.appendChild(editorPanel);

    this.previewPanel = document.createElement("div");
    this.previewPanel.className = "lcp-panel lcp-preview-panel";
    this.previewPanel.style.display = this.cfg.previewVisible ? "" : "none";

    this.iframe = document.createElement("iframe");
    this.iframe.className = "lcp-preview";
    this.iframe.setAttribute("sandbox", "allow-scripts");
    this.iframe.setAttribute("title", "Live preview");
    this.iframe.setAttribute("referrerpolicy", "no-referrer");

    this.previewPanel.appendChild(this.iframe);
    this.root.appendChild(this.previewPanel);

    this.container.appendChild(this.root);
  }

  private handleEditorKeydown(event: KeyboardEvent, textarea: HTMLTextAreaElement): void {
    if (event.key !== "Tab" || this.cfg.readOnly) return;
    event.preventDefault();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    textarea.value = `${value.slice(0, start)}  ${value.slice(end)}`;
    textarea.selectionStart = textarea.selectionEnd = start + 2;
    textarea.dispatchEvent(new Event("input"));
  }

  private selectLanguage(lang: LanguageKey): void {
    if (this.activeLanguage === lang) return;
    this.activeLanguage = lang;
    this.tabs.forEach((tab, key) => tab.setAttribute("aria-selected", String(key === lang)));
    this.editors.forEach((editor, key) =>
      editor.setAttribute("data-active", String(key === lang)),
    );
  }

  // ---------------------------------------------------------------------
  // Code + persistence
  // ---------------------------------------------------------------------

  private loadPersisted(): void {
    if (!this.storageKey) return;
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        this.code = { ...this.initialCode, ...parsed };
      }
    } catch {
      /* corrupt storage, ignore */
    }
  }

  private persist(): void {
    if (!this.storageKey) return;
    try {
      window.localStorage.setItem(this.storageKey, JSON.stringify(this.code));
    } catch {
      /* storage unavailable (quota, privacy mode, SSR) — fail silently */
    }
  }

  private handleInput(lang: LanguageKey, value: string): void {
    this.code[lang] = value;
    this.persist();
    this.emitter.emit("change", { language: lang, code: this.getCode() });
    if (this.cfg.autoRun) this.scheduleRun();
  }

  private scheduleRun(): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.run(), this.cfg.debounce);
  }

  // ---------------------------------------------------------------------
  // Console
  // ---------------------------------------------------------------------

  private renderEmptyConsole(): void {
    if (!this.consoleBody) return;
    this.consoleBody.innerHTML = "";
    const empty = document.createElement("div");
    empty.className = "lcp-console-empty";
    empty.textContent = "Console output will appear here.";
    this.consoleBody.appendChild(empty);
  }

  private appendConsoleLine(payload: { level: string; args: string[]; timestamp: number }): void {
    if (!this.consoleBody) return;
    if (this.consoleBody.querySelector(".lcp-console-empty")) {
      this.consoleBody.innerHTML = "";
    }
    const line = document.createElement("div");
    line.className = "lcp-console-line";
    line.dataset.level = payload.level;
    line.textContent = (payload.args || []).join(" ");
    this.consoleBody.appendChild(line);
    this.consoleBody.scrollTop = this.consoleBody.scrollHeight;

    this.emitter.emit("console", {
      level: (payload.level as ConsoleLevel) || "log",
      args: payload.args || [],
      timestamp: payload.timestamp || Date.now(),
    });
  }

  private clearConsole(): void {
    this.renderEmptyConsole();
  }

  // ---------------------------------------------------------------------
  // Theming
  // ---------------------------------------------------------------------

  private applyColors(colors: PlaygroundColors): void {
    const preset = THEME_PRESETS[this.cfg.theme];
    const merged: Required<PlaygroundColors> = { ...preset, ...colors };
    const map: Record<string, string> = {
      "--lcp-accent": merged.accent,
      "--lcp-background": merged.background,
      "--lcp-surface": merged.surface,
      "--lcp-border": merged.border,
      "--lcp-text": merged.text,
      "--lcp-muted": merged.muted,
      "--lcp-radius": merged.radius,
    };
    Object.entries(map).forEach(([key, value]) => {
      this.container.style.setProperty(key, value);
    });
  }

  // ---------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------

  run(): void {
    if (this.destroyed) return;
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    const doc = buildPreviewDocument(
      this.code.html || "",
      this.code.css || "",
      this.code.javascript || "",
    );
    if (this.cfg.previewVisible) {
      this.iframe.setAttribute("srcdoc", doc);
    }
    this.emitter.emit("run", { code: this.getCode() });
  }

  reset(): void {
    if (this.destroyed) return;
    this.code = { ...this.initialCode };
    this.editors.forEach((editor, lang) => {
      editor.value = this.code[lang] ?? "";
    });
    this.persist();
    this.emitter.emit("reset", { code: this.getCode() });
    if (this.cfg.autoRun) this.run();
  }

  getCode(): Record<LanguageKey, string> {
    return { ...this.code } as Record<LanguageKey, string>;
  }

  setCode(partial: PlaygroundCode, options?: { run?: boolean }): void {
    if (this.destroyed) return;
    Object.entries(partial).forEach(([lang, value]) => {
      if (typeof value !== "string") return;
      const key = lang as LanguageKey;
      this.code[key] = value;
      const editor = this.editors.get(key);
      if (editor) editor.value = value;
    });
    this.persist();
    this.emitter.emit("change", {
      language: this.activeLanguage,
      code: this.getCode(),
    });
    if (options?.run ?? this.cfg.autoRun) this.run();
  }

  setTheme(theme: ThemeName): void {
    if (this.destroyed) return;
    this.cfg.theme = theme === "light" ? "light" : "dark";
    this.root.dataset.theme = this.cfg.theme;
    this.applyColors(this.cfg.colors);
  }

  on<K extends keyof PlaygroundEventMap>(
    event: K,
    handler: (payload: PlaygroundEventMap[K]) => void,
  ): () => void {
    return this.emitter.on(event, handler);
  }

  off<K extends keyof PlaygroundEventMap>(
    event: K,
    handler: (payload: PlaygroundEventMap[K]) => void,
  ): void {
    this.emitter.off(event, handler);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    window.removeEventListener("message", this.onMessage);
    this.emitter.emit("destroy", {});
    this.emitter.clear();
    this.container.innerHTML = "";
    this.editors.clear();
    this.tabs.clear();
  }
}

type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";
