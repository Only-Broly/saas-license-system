/**
 * Live Code Playground — Public Type Definitions
 * ------------------------------------------------
 * These types describe the configuration/API surface of the embeddable
 * widget. Nothing in this file depends on React or any other framework.
 */

export type LanguageKey = "html" | "css" | "javascript";

export type ThemeName = "dark" | "light";

export interface PlaygroundColors {
  accent?: string;
  background?: string;
  surface?: string;
  border?: string;
  text?: string;
  muted?: string;
  radius?: string;
}

export type PlaygroundCode = Partial<Record<LanguageKey, string>>;

export interface EditorConfig {
  /** Font size in pixels for the code editors. Default: 14 */
  fontSize?: number;
  /** Disables editing of all editors. Default: false */
  readOnly?: boolean;
}

export interface PreviewConfig {
  /** Automatically re-run when code changes. Default: true */
  autoRun?: boolean;
  /** Debounce (ms) applied to auto-run. Default: 400 */
  debounce?: number;
  /** Show/hide the preview iframe entirely. Default: true */
  visible?: boolean;
}

export interface ControlsConfig {
  /** Show/hide the Run button. Default: true */
  run?: boolean;
  /** Show/hide the Reset button. Default: true */
  reset?: boolean;
  /** Show/hide the console panel. Default: true */
  console?: boolean;
}

export interface PersistenceConfig {
  /** Persist code to localStorage. Default: false (host owns persistence otherwise) */
  enabled?: boolean;
  /** Unique storage key. Required for meaningful persistence across reloads. */
  key?: string;
}

export interface PlaygroundConfig {
  /** CSS selector string or a concrete DOM element to mount into. */
  target?: string | Element;

  /** Initial source code per language. */
  code?: PlaygroundCode;

  /** Which language tabs are enabled, in display order. */
  languages?: LanguageKey[];

  /** Which language tab is selected initially. */
  activeLanguage?: LanguageKey;

  /** Visual theme preset. */
  theme?: ThemeName;

  /** Fine grained color overrides (CSS custom properties under the hood). */
  colors?: PlaygroundColors;

  editor?: EditorConfig;

  preview?: PreviewConfig;

  controls?: ControlsConfig;

  persistence?: PersistenceConfig;

  /** Height of the widget. Number = pixels, or any valid CSS length string. */
  height?: number | string;

  /** Custom element tag name override. Default: "live-code-playground" */
  tag?: string;
}

export interface ConsoleMessage {
  level: "log" | "info" | "warn" | "error" | "debug";
  args: string[];
  timestamp: number;
}

export interface PlaygroundErrorPayload {
  message: string;
  stack?: string;
  source?: "runtime" | "console";
}

export interface PlaygroundEventMap {
  ready: { code: Record<LanguageKey, string> };
  change: { language: LanguageKey; code: Record<LanguageKey, string> };
  run: { code: Record<LanguageKey, string> };
  reset: { code: Record<LanguageKey, string> };
  error: PlaygroundErrorPayload;
  console: ConsoleMessage;
  destroy: Record<string, never>;
}

export type PlaygroundEventName = keyof PlaygroundEventMap;

export type PlaygroundEventHandler<K extends PlaygroundEventName> = (
  payload: PlaygroundEventMap[K],
) => void;

/**
 * The public, framework-agnostic API returned by `createPlayground()` and
 * mirrored as methods on the `<live-code-playground>` custom element.
 */
export interface PlaygroundInstance {
  run(): void;
  reset(): void;
  getCode(): Record<LanguageKey, string>;
  setCode(code: PlaygroundCode, options?: { run?: boolean }): void;
  setTheme(theme: ThemeName): void;
  on<K extends PlaygroundEventName>(
    event: K,
    handler: PlaygroundEventHandler<K>,
  ): () => void;
  off<K extends PlaygroundEventName>(
    event: K,
    handler: PlaygroundEventHandler<K>,
  ): void;
  destroy(): void;
  /** The underlying custom element, exposed for advanced integrations. */
  readonly element: HTMLElement;
}
