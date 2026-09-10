/**
 * Live Code Playground — Public entry point.
 *
 * This is the ONLY module external consumers (and the demo host page in
 * this repo) should import from. Everything else under `src/widget/*` is
 * an internal implementation detail.
 */
export { createPlayground } from "./create-playground";
export { registerLiveCodePlayground, LiveCodePlaygroundElement, DEFAULT_TAG_NAME } from "./element";
export { PlaygroundCore } from "./core";

export type {
  LanguageKey,
  ThemeName,
  PlaygroundColors,
  PlaygroundCode,
  EditorConfig,
  PreviewConfig,
  ControlsConfig,
  PersistenceConfig,
  PlaygroundConfig,
  ConsoleMessage,
  PlaygroundErrorPayload,
  PlaygroundEventMap,
  PlaygroundEventName,
  PlaygroundEventHandler,
  PlaygroundInstance,
} from "./types";

// Registering the custom element as a side effect means consumers who only
// want the declarative `<live-code-playground config="...">` tag can do:
//   import "live-code-playground/register";
// while `createPlayground()` remains the recommended, richer API.
import { registerLiveCodePlayground } from "./element";
if (typeof window !== "undefined") {
  registerLiveCodePlayground();
}
