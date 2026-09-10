import { DEFAULT_TAG_NAME, LiveCodePlaygroundElement, registerLiveCodePlayground } from "./element";
import type {
  PlaygroundCode,
  PlaygroundConfig,
  PlaygroundEventHandler,
  PlaygroundEventName,
  PlaygroundInstance,
  ThemeName,
} from "./types";

function resolveTarget(target: PlaygroundConfig["target"]): Element {
  if (!target) {
    throw new Error(
      "[live-code-playground] `target` is required — pass a CSS selector or a DOM element.",
    );
  }
  if (typeof target === "string") {
    const el = document.querySelector(target);
    if (!el) {
      throw new Error(`[live-code-playground] no element matches selector "${target}"`);
    }
    return el;
  }
  return target;
}

/**
 * Creates and mounts a Live Code Playground instance.
 *
 * ```js
 * import { createPlayground } from "live-code-playground";
 *
 * const playground = createPlayground({
 *   target: "#playground",
 *   code: { html: "<h1>Hello</h1>" },
 * });
 * ```
 */
export function createPlayground(config: PlaygroundConfig): PlaygroundInstance {
  const tagName = config.tag || DEFAULT_TAG_NAME;
  registerLiveCodePlayground(tagName);

  const target = resolveTarget(config.target);
  // Ensure a clean mount point so re-invoking on the same target never
  // stacks duplicate widgets.
  target.innerHTML = "";

  const element = document.createElement(tagName) as LiveCodePlaygroundElement;
  target.appendChild(element);
  element.configure(config);

  const listenerMap = new WeakMap<
    PlaygroundEventHandler<PlaygroundEventName>,
    EventListener
  >();

  const instance: PlaygroundInstance = {
    run: () => element.run(),
    reset: () => element.reset(),
    getCode: () => element.getCode() ?? ({} as Record<string, string>),
    setCode: (code: PlaygroundCode, options?: { run?: boolean }) =>
      element.setCode(code, options),
    setTheme: (theme: ThemeName) => element.setTheme(theme),
    on: (event, handler) => {
      const wrapped = ((e: CustomEvent) => handler(e.detail)) as EventListener;
      listenerMap.set(handler as PlaygroundEventHandler<PlaygroundEventName>, wrapped);
      element.addEventListener(`lcp-${event}`, wrapped);
      return () => element.removeEventListener(`lcp-${event}`, wrapped);
    },
    off: (event, handler) => {
      const wrapped = listenerMap.get(handler as PlaygroundEventHandler<PlaygroundEventName>);
      if (wrapped) {
        element.removeEventListener(`lcp-${event}`, wrapped);
        listenerMap.delete(handler as PlaygroundEventHandler<PlaygroundEventName>);
      }
    },
    destroy: () => {
      element.destroy();
      element.remove();
    },
    element,
  };

  return instance;
}
