import { useCallback, useState } from "react";
import PlaygroundEmbed from "@/demo/PlaygroundEmbed";
import IsolationCheck from "@/demo/IsolationCheck";
import CodeSnippet from "@/demo/CodeSnippet";
import EventLog from "@/demo/EventLog";
import type { PlaygroundInstance } from "@/widget";

const MINIMAL_SNIPPET = `<div id="playground"></div>

<script type="module">
  import { createPlayground } from "./widget/live-code-playground.es.js";

  createPlayground({
    target: "#playground",
    code: {
      html: "<h1>Hello World</h1>",
      css: "h1 { color: #6366f1; }",
      javascript: "console.log('Hello');"
    }
  });
</script>`;

const WEB_COMPONENT_SNIPPET = `<script type="module" src="./widget/live-code-playground.es.js"></script>

<live-code-playground
  config='{"code": {"html": "<h1>Hi</h1>"}, "theme": "dark"}'
></live-code-playground>`;

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-8 max-w-3xl text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{title}</h2>
      <p className="mt-3 text-slate-600">{description}</p>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function App() {
  const [autoRunInstance, setAutoRunInstance] = useState<PlaygroundInstance | null>(null);
  const [controlInstance, setControlInstance] = useState<PlaygroundInstance | null>(null);
  const [controlMounted, setControlMounted] = useState(true);
  const [lastCodeDump, setLastCodeDump] = useState<string>("");

  const handleAutoRunReady = useCallback((instance: PlaygroundInstance) => {
    setAutoRunInstance(instance);
  }, []);

  const handleControlReady = useCallback((instance: PlaygroundInstance) => {
    setControlInstance(instance);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24 text-slate-900">
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
            Embeddable SDK Demo Host
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Live Code Playground
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            A framework-agnostic, embeddable code playground widget. Shadow-DOM isolated,
            sandboxed execution, tiny public API. This page is only a{" "}
            <strong>demo host</strong> — every playground below is created with the exact same{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-indigo-700">createPlayground()</code>{" "}
            function a third-party site would use.
          </p>
          <div className="mx-auto mt-8 grid max-w-3xl gap-3 text-left sm:grid-cols-3">
            <Card className="text-sm">
              <p className="font-semibold text-slate-900">🧩 Framework-agnostic</p>
              <p className="mt-1 text-slate-500">Plain JS, ESM, or a Web Component. No React required.</p>
            </Card>
            <Card className="text-sm">
              <p className="font-semibold text-slate-900">🛡️ Shadow DOM isolated</p>
              <p className="mt-1 text-slate-500">Host CSS never leaks in or out.</p>
            </Card>
            <Card className="text-sm">
              <p className="font-semibold text-slate-900">🔒 Sandboxed execution</p>
              <p className="mt-1 text-slate-500">Student code runs in a locked-down iframe.</p>
            </Card>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-xs text-slate-400">
            Distributable build:{" "}
            <a className="underline hover:text-indigo-600" href="./widget/live-code-playground.es.js">
              /widget/live-code-playground.es.js
            </a>{" "}
            · Plain-HTML embed test:{" "}
            <a className="underline hover:text-indigo-600" href="./embed-test.html" target="_blank" rel="noreferrer">
              /embed-test.html
            </a>
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-24 px-6 pt-16">
        {/* -------------------------------------------------------------- */}
        {/* 1. Minimal embed                                                */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 1"
            title="Minimal embed"
            description="Three configuration fields is all it takes. Sensible defaults handle the rest."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <CodeSnippet code={MINIMAL_SNIPPET} />
            <Card className="p-0 overflow-hidden">
              <PlaygroundEmbed
                config={{
                  code: {
                    html: "<h1>Hello World</h1>",
                    css: "h1 { color: #6366f1; font-family: sans-serif; }",
                    javascript: "console.log('Hello');",
                  },
                  persistence: { enabled: false },
                }}
              />
            </Card>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 2. Web component usage                                         */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Alternative API"
            title="Or use the Web Component directly"
            description="createPlayground() is sugar around a real custom element: <live-code-playground>. Use whichever fits your stack."
          />
          <CodeSnippet code={WEB_COMPONENT_SNIPPET} />
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 3. Multiple independent instances                              */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 2"
            title="Multiple independent instances"
            description="Two widgets, two themes, two starter snippets, two localStorage keys. Editing one never touches the other."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-0 overflow-hidden">
              <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Instance A · dark theme · persisted as "demo-instance-a"
              </p>
              <PlaygroundEmbed
                config={{
                  theme: "dark",
                  code: {
                    html: "<button id=\"a-btn\">Click me (A)</button>",
                    css: "#a-btn { padding: 10px 16px; border-radius: 8px; border: none; background: #6366f1; color: white; font-weight: 600; cursor: pointer; }",
                    javascript:
                      "document.getElementById('a-btn').addEventListener('click', () => console.log('Instance A clicked'));",
                  },
                  persistence: { enabled: true, key: "demo-instance-a" },
                }}
              />
            </Card>
            <Card className="p-0 overflow-hidden">
              <p className="border-b border-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Instance B · light theme · persisted as "demo-instance-b"
              </p>
              <PlaygroundEmbed
                config={{
                  theme: "light",
                  colors: { accent: "#059669" },
                  code: {
                    html: "<button id=\"b-btn\">Click me (B)</button>",
                    css: "#b-btn { padding: 10px 16px; border-radius: 8px; border: none; background: #059669; color: white; font-weight: 600; cursor: pointer; }",
                    javascript:
                      "document.getElementById('b-btn').addEventListener('click', () => console.log('Instance B clicked'));",
                  },
                  persistence: { enabled: true, key: "demo-instance-b" },
                }}
              />
            </Card>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 4. Custom theme & colors                                       */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 3"
            title="Custom theme & accent colors"
            description="Every color is a CSS custom property (--lcp-accent, --lcp-background, ...) so brand matching is trivial."
          />
          <Card className="p-0 overflow-hidden">
            <PlaygroundEmbed
              config={{
                theme: "dark",
                colors: {
                  accent: "#f97316",
                  background: "#1a1030",
                  surface: "#241640",
                  border: "rgba(255,255,255,0.15)",
                },
                code: {
                  html: "<div class=\"badge\">Branded playground</div>",
                  css: ".badge { padding: 14px 20px; border-radius: 999px; background: #f97316; color: #1a1030; font-weight: 800; font-family: sans-serif; display: inline-block; }",
                  javascript: "",
                },
              }}
            />
          </Card>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 5. Auto-run disabled + programmatic run()                      */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 4"
            title="Manual run mode + external control"
            description="autoRun: false disables live updates. The host page can still trigger run() programmatically."
          />
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-0 overflow-hidden">
              <PlaygroundEmbed
                config={{
                  preview: { autoRun: false },
                  code: {
                    html: "<p>Edit me, then hit Run — nothing updates automatically.</p>",
                    css: "p { font-family: sans-serif; }",
                    javascript: "console.log('Executed manually');",
                  },
                }}
                onReady={handleAutoRunReady}
              />
            </Card>
            <Card className="flex flex-col justify-center gap-3">
              <p className="text-sm text-slate-500">
                This button lives entirely on the host page and calls the widget's public API.
              </p>
              <button
                type="button"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500"
                onClick={() => autoRunInstance?.run()}
              >
                ▶ Call instance.run()
              </button>
            </Card>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 6. Read-only mode                                              */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 5"
            title="Read-only mode"
            description="Great for showcasing a solution without letting learners modify it."
          />
          <Card className="p-0 overflow-hidden">
            <PlaygroundEmbed
              config={{
                editor: { readOnly: true },
                code: {
                  html: "<h2>This code cannot be edited</h2>",
                  css: "h2 { font-family: sans-serif; color: #334155; }",
                  javascript: "console.log('Read-only playground loaded');",
                },
              }}
            />
          </Card>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 7. Programmatic API + events + destroy/recreate                */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Example 6"
            title="Programmatic API, events & lifecycle"
            description="getCode(), setCode(), reset(), events, and destroy()/recreate — everything an LMS integration needs."
          />
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <Card className="p-0 overflow-hidden">
              {controlMounted ? (
                <PlaygroundEmbed
                  config={{
                    code: {
                      html: "<p id=\"greeting\">Hello, student!</p>",
                      css: "#greeting { font-family: sans-serif; }",
                      javascript: "console.log('control demo ready');",
                    },
                  }}
                  onReady={handleControlReady}
                />
              ) : (
                <div className="flex h-[480px] items-center justify-center text-sm text-slate-400">
                  Widget destroyed. Click "Recreate" to mount a fresh instance.
                </div>
              )}
            </Card>
            <div className="space-y-4">
              <Card className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => setLastCodeDump(JSON.stringify(controlInstance?.getCode(), null, 2))}
                  >
                    getCode()
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() =>
                      controlInstance?.setCode({
                        html: "<p id=\"greeting\">Updated via setCode()!</p>",
                      })
                    }
                  >
                    setCode()
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => controlInstance?.reset()}
                  >
                    reset()
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => controlInstance?.setTheme("light")}
                  >
                    setTheme("light")
                  </button>
                  <button
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                    onClick={() => controlInstance?.setTheme("dark")}
                  >
                    setTheme("dark")
                  </button>
                  <button
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => {
                      controlInstance?.destroy();
                      setControlInstance(null);
                      setControlMounted(false);
                    }}
                  >
                    destroy()
                  </button>
                  <button
                    className="rounded-lg border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                    onClick={() => setControlMounted(true)}
                    disabled={controlMounted}
                  >
                    Recreate
                  </button>
                </div>
                {lastCodeDump && (
                  <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-slate-950 p-2 text-[11px] text-slate-100">
                    {lastCodeDump}
                  </pre>
                )}
              </Card>
              <Card>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Event log</p>
                <EventLog instance={controlInstance} />
              </Card>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------------------- */}
        {/* 8. Hostile CSS stress test                                     */}
        {/* -------------------------------------------------------------- */}
        <section>
          <SectionHeading
            eyebrow="Isolation stress test"
            title="This entire demo page uses hostile global CSS"
            description={
              'Open index.css: "button", "textarea", "pre", "code" and "div" are styled ' +
              "aggressively with !important, site-wide. The playground below is untouched."
            }
          />
          <div className="space-y-4">
            <IsolationCheck />
            <Card className="p-0 overflow-hidden">
              <PlaygroundEmbed
                config={{
                  code: {
                    html: "<button>A real button, inside the widget</button>",
                    css: "button { font-family: sans-serif; padding: 8px 14px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; cursor: pointer; }",
                    javascript: "console.log('This button ignores the hostile host styles.');",
                  },
                }}
              />
            </Card>
            <p className="text-center text-xs text-slate-400">
              Notice the button rendered *inside* the playground above stays clean, while every
              other button on this page (including the ones in the previous sections) is forced
              into the hostile yellow/magenta Comic Sans style by this page's own CSS.
            </p>
          </div>
        </section>
      </main>

      <footer className="mx-auto mt-24 max-w-6xl border-t border-slate-200 px-6 pt-8 text-center text-xs text-slate-400">
        <p>
          Live Code Playground SDK — core widget lives in{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5">src/widget/</code>. This page is a
          demo/integration host only. See <code className="rounded bg-slate-100 px-1 py-0.5">README.md</code> for
          full integration docs.
        </p>
      </footer>
    </div>
  );
}
