/**
 * Builds the isolated document executed inside the sandboxed <iframe>.
 *
 * Security model:
 * - The iframe uses `sandbox="allow-scripts"` ONLY (no `allow-same-origin`),
 *   which forces the document into a unique, opaque origin. That means
 *   student code cannot read/write the parent DOM, cannot access
 *   `document.cookie`, and `localStorage`/`sessionStorage` throw/are
 *   unavailable — even though scripts are allowed to run.
 * - The only channel back to the widget is `postMessage`, which the widget
 *   validates by comparing `event.source` to the exact iframe window before
 *   trusting any payload.
 */

const BRIDGE_SCRIPT = `
(function () {
  function post(type, payload) {
    try {
      parent.postMessage({ __lcp: true, type: type, payload: payload }, "*");
    } catch (e) {}
  }
  function safe(value) {
    if (typeof value === "string") return value;
    try {
      return JSON.stringify(value, null, 2);
    } catch (e) {
      try { return String(value); } catch (e2) { return "[unserializable value]"; }
    }
  }
  ["log", "info", "warn", "error", "debug"].forEach(function (level) {
    var original = console[level] ? console[level].bind(console) : function(){};
    console[level] = function () {
      var args = Array.prototype.slice.call(arguments).map(safe);
      post("console", { level: level, args: args, timestamp: Date.now() });
      original.apply(console, arguments);
    };
  });
  window.addEventListener("error", function (event) {
    post("error", {
      message: event.message || "Script error",
      stack: event.error && event.error.stack,
      source: "runtime",
    });
  });
  window.addEventListener("unhandledrejection", function (event) {
    var reason = event.reason;
    post("error", {
      message: "Unhandled promise rejection: " + (reason && reason.message ? reason.message : safe(reason)),
      stack: reason && reason.stack,
      source: "runtime",
    });
  });
})();
`;

function escapeClosingTags(source: string, tag: string): string {
  const re = new RegExp(`</${tag}`, "gi");
  return source.replace(re, `<\\/${tag}`);
}

export function buildPreviewDocument(
  html: string,
  css: string,
  js: string,
): string {
  const safeHtml = escapeClosingTags(html ?? "", "script");
  const safeCss = escapeClosingTags(css ?? "", "style");
  const safeJs = escapeClosingTags(js ?? "", "script");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="referrer" content="no-referrer" />
    <style>
      html, body { margin: 0; padding: 8px; font-family: system-ui, sans-serif; color: #111; }
    </style>
    <style>${safeCss}</style>
    <script>${BRIDGE_SCRIPT}</script>
  </head>
  <body>
    ${safeHtml}
    <script>
      try {
        ${safeJs}
      } catch (e) {
        parent.postMessage({ __lcp: true, type: "error", payload: { message: e.message, stack: e.stack, source: "runtime" } }, "*");
      }
    </script>
  </body>
</html>`;
}
