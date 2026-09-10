# Live Code Playground SDK

A framework-agnostic, embeddable **live code playground widget** (HTML/CSS/JS
editor + live preview + console) designed to be dropped into any website —
blogs, docs sites, LMS platforms, or plain HTML pages.

> **This repository is a product + a demo.** The actual product is the
> widget in [`src/widget/`](./src/widget). Everything else — the React page
> at [`src/App.tsx`](./src/App.tsx) and [`public/embed-test.html`](./public/embed-test.html)
> — exists only to demonstrate and test the widget as an external consumer
> would use it.

---

## Table of contents

1. [Architecture](#architecture)
2. [Installation](#installation)
3. [Basic usage](#basic-usage)
4. [Web Component usage](#web-component-usage)
5. [Browser / CDN usage](#browser--cdn-usage)
6. [Configuration reference](#configuration-reference)
7. [JavaScript API](#javascript-api)
8. [Events](#events)
9. [Theming](#theming)
10. [Multiple instances](#multiple-instances)
11. [Cleanup / destroy](#cleanup--destroy)
12. [Security model](#security-model)
13. [Style isolation](#style-isolation)
14. [Building the widget](#building-the-widget)
15. [Publishing as an npm package](#publishing-as-an-npm-package)
16. [Embed examples](#embed-examples)

---

## Architecture

```
src/
  widget/                 ← THE PRODUCT (framework-agnostic, no React)
    types.ts              Public TypeScript types / config shape
    emitter.ts             Tiny internal pub/sub event emitter
    sandbox.ts             Builds the sandboxed <iframe> preview document
    styles.ts               Shadow-DOM-scoped CSS (--lcp-* custom properties)
    core.ts                 PlaygroundCore — owns ALL playground behaviour
    element.ts              <live-code-playground> Web Component (Shadow DOM)
    create-playground.ts    createPlayground() convenience function API
    index.ts                Public entry point (the only file to import)

  demo/                   ← DEMO-ONLY React glue (not part of the product)
    PlaygroundEmbed.tsx     Thin React wrapper around createPlayground()
    IsolationCheck.tsx      Live proof that Shadow DOM isolation works
    EventLog.tsx / CodeSnippet.tsx

  App.tsx                 ← Demo / integration-example host page

public/
  widget/                 ← Prebuilt distributable widget (see "Building")
    live-code-playground.es.js   ESM build
    live-code-playground.js      UMD/global build (CDN-style, `<script>` tag)
  embed-test.html         ← Plain HTML page (NO framework, NO build step)
                             that imports the distributable artifact directly
                             and runs automated acceptance checks in-browser.
```

**One core, two integration surfaces.** `PlaygroundCore` is the single
implementation of the playground. `<live-code-playground>` (a Web Component
with Shadow DOM) hosts one `PlaygroundCore` instance per element.
`createPlayground()` is a small convenience function that creates that
element for you and returns a plain-object API — it introduces no parallel
logic, just ergonomics.

## Installation

This repo ships the widget as static build output under `public/widget/`
(see [Building the widget](#building-the-widget)). If this were published to
npm, installation would be:

```bash
npm install live-code-playground
```

```js
import { createPlayground } from "live-code-playground";
```

Until then, consume it exactly like the demo pages do — via the built file:

```js
import { createPlayground } from "./widget/live-code-playground.es.js";
```

## Basic usage

```html
<div id="playground"></div>

<script type="module">
  import { createPlayground } from "./widget/live-code-playground.es.js";

  const playground = createPlayground({
    target: "#playground",
    code: {
      html: "<h1>Hello World</h1>",
      css: "h1 { color: #6366f1; }",
      javascript: "console.log('Hello');",
    },
    languages: ["html", "css", "javascript"],
    activeLanguage: "html",
    theme: "dark",
    colors: { accent: "#6366f1" },
    preview: { autoRun: true, debounce: 400 },
  });
</script>
```

`target` accepts a CSS selector string **or** a DOM element reference. No
React, Vue, Angular, or any build tooling is required — this works in a
static `.html` file opened over any web server.

## Web Component usage

`createPlayground()` is sugar around a real custom element. You can use the
element directly, including declaratively via HTML with a JSON `config`
attribute:

```html
<script type="module" src="./widget/live-code-playground.es.js"></script>

<live-code-playground
  config='{"theme":"dark","code":{"html":"<h1>Hi</h1>"}}'
></live-code-playground>
```

Or imperatively:

```js
import { registerLiveCodePlayground, LiveCodePlaygroundElement } from "./widget/live-code-playground.es.js";

registerLiveCodePlayground(); // idempotent, safe to call multiple times

const el = document.createElement("live-code-playground");
document.body.appendChild(el);
el.configure({ code: { html: "<p>Hi</p>" } });

el.run();
el.reset();
el.getCode();
el.setCode({ html: "<p>Updated</p>" });
el.setTheme("light");
el.destroy();
```

Both APIs are backed by the exact same `PlaygroundCore` — pick whichever
fits your host platform's conventions.

## Browser / CDN usage

The UMD build (`live-code-playground.js`) exposes a global
`LiveCodePlayground` object for environments without ESM support:

```html
<script src="https://your-cdn.example.com/live-code-playground.js"></script>
<script>
  LiveCodePlayground.createPlayground({
    target: "#playground",
    code: { html: "<h1>Hi</h1>" },
  });
</script>
```

Prefer the ESM build (`live-code-playground.es.js`) with `<script type="module">`
whenever possible.

## Configuration reference

```ts
createPlayground({
  target: "#playground", // CSS selector or Element (required)

  code: {                // initial source per language
    html: "...",
    css: "...",
    javascript: "...",
  },

  languages: ["html", "css", "javascript"], // enabled tabs, in order
  activeLanguage: "html",                   // initially selected tab

  theme: "dark" | "light",

  colors: {                 // maps to --lcp-* CSS custom properties
    accent: "#7c3aed",
    background: "#111318",
    surface: "#171a21",
    border: "rgba(255,255,255,.12)",
    text: "#e6e6e6",
    muted: "#9096a2",
    radius: "10px",
  },

  editor: {
    fontSize: 14,
    readOnly: false,
  },

  preview: {
    autoRun: true,     // re-run automatically as the student types
    debounce: 400,     // ms, only relevant when autoRun is true
    visible: true,     // show/hide the preview iframe entirely
  },

  controls: {
    run: true,      // show/hide the Run button
    reset: true,    // show/hide the Reset button
    console: true,  // show/hide the console panel
  },

  persistence: {
    enabled: false,               // opt-in; localStorage is NOT required
    key: "lesson-profile-card",   // unique key when enabled
  },

  height: 480,        // number (px) or any CSS length, e.g. "60vh"
  tag: "live-code-playground", // advanced: customize the element tag name
});
```

All fields are optional except `target`. Minimal integrations can omit
everything else.

### Why localStorage is optional

`persistence.enabled` is `false` by default. Host platforms (an LMS, a
course backend, etc.) are expected to own progress persistence themselves
using `getCode()` and the `change` event — the widget never assumes it owns
the student's data.

## JavaScript API

```ts
const playground = createPlayground(config);

playground.run();                 // force a preview re-render
playground.reset();               // restore this instance's starter code
playground.getCode();             // -> { html, css, javascript }
playground.setCode({ html: "..." }, { run: true }); // partial update
playground.setTheme("light");     // swap theme at runtime
playground.on("change", (e) => {/* ... */});
playground.off("change", handler);
playground.destroy();             // full teardown (see below)
playground.element;               // underlying <live-code-playground> node
```

## Events

| Event     | Payload                                      | Fires when                          |
|-----------|-----------------------------------------------|--------------------------------------|
| `ready`   | `{ code }`                                    | widget finished initializing         |
| `change`  | `{ language, code }`                          | student edits any editor / `setCode` |
| `run`     | `{ code }`                                    | preview executes (manual or auto)    |
| `reset`   | `{ code }`                                    | `reset()` restores starter code      |
| `error`   | `{ message, stack?, source }`                 | uncaught error inside student code   |
| `console` | `{ level, args, timestamp }`                  | `console.*` call inside student code |

```js
playground.on("change", (event) => {
  // e.g. an LMS could debounce-save event.code to its own backend
  saveProgressToBackend(event.code);
});
```

The Web Component also dispatches standards-based `CustomEvent`s
(`lcp-ready`, `lcp-change`, `lcp-run`, `lcp-reset`, `lcp-error`,
`lcp-console`) that bubble and cross shadow boundaries (`composed: true`),
so you can also do:

```js
document.querySelector("live-code-playground")
  .addEventListener("lcp-change", (e) => console.log(e.detail));
```

## Theming

Every visual token is a prefixed CSS custom property set on the widget's
Shadow DOM host:

```
--lcp-accent
--lcp-background
--lcp-surface
--lcp-border
--lcp-text
--lcp-muted
--lcp-radius
```

Set them via `colors` in config (recommended, works per-instance), or by
selecting the element and setting inline custom properties directly if you
need to theme after creation:

```js
playground.element.style.setProperty("--lcp-accent", "#f97316");
```

`setTheme("dark" | "light")` switches between two curated presets and then
re-applies any `colors` overrides on top.

## Multiple instances

Every `createPlayground()` call creates an independent
`<live-code-playground>` element with its own Shadow DOM, its own
`PlaygroundCore`, its own debounce timers, and (if enabled) its own
`localStorage` key. Nothing is shared globally.

```js
const a = createPlayground({ target: "#exercise-1", persistence: { enabled: true, key: "ex-1" } });
const b = createPlayground({ target: "#exercise-2", persistence: { enabled: true, key: "ex-2" } });
```

See the demo page for two side-by-side instances proving independent state,
independent previews, and independent Run/Reset behavior.

## Cleanup / destroy

```js
playground.destroy();
```

`destroy()`:
- removes the `message` listener used for preview↔widget communication,
- clears any pending debounce timers,
- clears all internal event listeners,
- removes the iframe (stopping any running student script),
- removes all DOM the widget created, including the custom element itself.

This makes it safe to use inside SPA/LMS route transitions — mount, unmount,
and remount freely (see the "Programmatic API, events & lifecycle" example
on the demo page, which destroys and recreates a live instance).

## Security model

Two independent isolation boundaries are enforced:

**1. Widget vs. host page (style/behavior isolation)**
The widget renders inside a **Shadow DOM** (`attachShadow({ mode: "open" })`).
`:host { all: initial; }` blocks inherited properties from a hostile host
stylesheet, and every internal class is scoped and `lcp-`-prefixed. Host CSS
that targets generic tags (`button`, `div`, `textarea`, `pre`, `code`, ...)
cannot reach inside the shadow tree, and the widget's own styles never leak
out.

**2. Student code vs. widget/host (execution isolation)**
Student HTML/CSS/JS never executes in the widget's or host page's JS
context. It runs inside a `<iframe sandbox="allow-scripts">` **without**
`allow-same-origin`, which forces the iframe onto a unique, opaque origin.
As a result student code:
- cannot access `parent`/host DOM,
- cannot read `document.cookie`,
- cannot access `localStorage`/`sessionStorage`,
- cannot navigate the top-level page.

The only channel back to the widget is `window.postMessage`, and the widget
only trusts messages whose `event.source` is exactly that iframe's
`contentWindow` — messages from anywhere else are ignored.

See [`src/widget/sandbox.ts`](./src/widget/sandbox.ts) for the exact
preview document construction and [`src/widget/core.ts`](./src/widget/core.ts)
for the message validation.

## Style isolation

- No global CSS resets; no rules on bare `button`, `input`, `div`, etc.
  outside the Shadow DOM.
- All widget styles live in one `<style>` tag injected into the widget's own
  Shadow DOM (see `src/widget/styles.ts`).
- Configurable design tokens are exposed exclusively via `--lcp-*` custom
  properties.
- `public/embed-test.html` and the React demo (`src/App.tsx` /
  `src/index.css`) intentionally ship aggressive, `!important`-laden rules
  targeting `button`, `textarea`, `pre`, `code`, and `div` site-wide to prove
  the widget is unaffected — open dev tools on either page and inspect the
  widget vs. the rest of the page.

## Building the widget

The widget has its own Vite library config, separate from the demo app's
`vite.config.ts` (which builds `dist/index.html` for the React demo):

```bash
npx vite build --config vite.widget.config.ts
```

This produces:

```
public/widget/live-code-playground.es.js   (ESM)
public/widget/live-code-playground.js      (UMD / global "LiveCodePlayground")
```

Because these live under `public/`, the demo app's normal `npm run build`
copies them into `dist/widget/*` automatically, and `dist/embed-test.html`
(also a static file under `public/`) can load them with a plain relative
`<script type="module">` import — exactly like a real third-party site
would from a CDN. This is how the distributable artifact gets tested
independently from the demo application; see `public/embed-test.html`'s
"Run automated checks" button for a self-contained in-browser test suite
covering the acceptance criteria (events, `getCode`/`setCode`, `reset`,
`destroy`/recreate, and style-isolation assertions).

## Publishing as an npm package

The widget is structured so it could be extracted and published on its own.
A future standalone `package.json` for it would look like:

```json
{
  "name": "live-code-playground",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/live-code-playground.js",
  "module": "./dist/live-code-playground.es.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/live-code-playground.es.js",
      "require": "./dist/live-code-playground.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "sideEffects": false
}
```

`src/widget/` has zero runtime dependencies (no React, no third-party
libraries), keeping the eventual published bundle small (~7 KB gzipped ESM).

## Embed examples

All of these are live on the demo page (`src/App.tsx`) and/or
`public/embed-test.html`:

1. **Minimal embed** — 3-field config, defaults do the rest.
2. **Custom theme/colors** — branded accent/background/surface via `colors`.
3. **Custom starter code** — arbitrary HTML/CSS/JS seeded per instance.
4. **Auto-run disabled** — `preview.autoRun: false` + an external "Run"
   button calling `instance.run()`.
5. **Read-only** — `editor.readOnly: true`, ideal for showcasing solutions.
6. **Two independent instances** — separate themes, code, and persistence
   keys on one page.
7. **Programmatic control + events + lifecycle** — `getCode`/`setCode`,
   an event log, and `destroy()` + recreate.
8. **Plain HTML, zero build tooling** — `public/embed-test.html`, with
   in-browser automated acceptance checks.
