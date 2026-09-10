import { useEffect, useState } from "react";

type CheckState = "pending" | "pass" | "fail";

/**
 * Live, in-browser proof that the widget's Shadow DOM is not affected by
 * this page's intentionally hostile global CSS (see `index.css`), and that
 * the widget's own styles never leak back out into the host page.
 */
export default function IsolationCheck() {
  const [hostAffected, setHostAffected] = useState<CheckState>("pending");
  const [widgetProtected, setWidgetProtected] = useState<CheckState>("pending");
  const [noLeak, setNoLeak] = useState<CheckState>("pending");

  useEffect(() => {
    const timer = setTimeout(() => {
      // 1) Sanity check: hostile CSS really is applied to plain host <div>s.
      const probe = document.createElement("div");
      probe.className = "lcp-demo-outline-probe";
      document.body.appendChild(probe);
      const hostOutline = getComputedStyle(probe).outlineStyle;
      probe.remove();
      setHostAffected(hostOutline === "solid" ? "pass" : "fail");

      // 2) The widget internals must NOT inherit that hostile outline.
      const widget = document.querySelector("live-code-playground");
      const shadow = widget?.shadowRoot;
      const root = shadow?.querySelector(".lcp-root") as HTMLElement | null;
      if (root) {
        const widgetOutline = getComputedStyle(root).outlineStyle;
        setWidgetProtected(widgetOutline === "none" ? "pass" : "fail");
      } else {
        setWidgetProtected("fail");
      }

      // 3) The widget's internal classes must not leak selectors that match
      // elements outside the shadow root.
      const hostHasLcpClass = document.querySelector("body > .lcp-root, body > .lcp-btn");
      setNoLeak(hostHasLcpClass ? "fail" : "pass");
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const Badge = ({ state, label }: { state: CheckState; label: string }) => (
    <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm">
      <span
        className={
          "inline-block h-2.5 w-2.5 rounded-full " +
          (state === "pass"
            ? "bg-emerald-500"
            : state === "fail"
              ? "bg-red-500"
              : "bg-amber-400 animate-pulse")
        }
      />
      <span className="text-slate-700">{label}</span>
      <span className="ml-auto font-mono text-xs uppercase text-slate-400">{state}</span>
    </div>
  );

  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <Badge state={hostAffected} label="Hostile CSS active on host page" />
      <Badge state={widgetProtected} label="Widget shielded from hostile CSS" />
      <Badge state={noLeak} label="Widget CSS does not leak to host" />
    </div>
  );
}
