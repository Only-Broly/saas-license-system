/**
 * Shadow-DOM-scoped stylesheet for the widget.
 *
 * Isolation strategy:
 * - `:host { all: initial; }` resets any property that could otherwise be
 *   inherited from a hostile host page (font-family, color, line-height...).
 * - Every class is prefixed with `lcp-` to avoid collisions if the core is
 *   ever reused outside of a shadow root.
 * - Only the documented `--lcp-*` custom properties are meant to be
 *   configured from the outside.
 */
export const WIDGET_STYLES = `
:host {
  all: initial;
  display: block;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;

  --lcp-accent: #6366f1;
  --lcp-background: #0f1115;
  --lcp-surface: #171a21;
  --lcp-border: rgba(255, 255, 255, 0.12);
  --lcp-text: #e7e9ee;
  --lcp-muted: #8b93a1;
  --lcp-radius: 10px;
  --lcp-danger: #ef4444;
  --lcp-success: #22c55e;
}

.lcp-root, .lcp-root * , .lcp-root *::before, .lcp-root *::after {
  box-sizing: border-box;
}

.lcp-root {
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  color: var(--lcp-text);
  background: var(--lcp-background);
  border: 1px solid var(--lcp-border);
  border-radius: var(--lcp-radius);
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  height: 480px;
  min-height: 200px;
  isolation: isolate;
}

.lcp-root[data-preview-hidden="true"] {
  grid-template-columns: minmax(0, 1fr);
}

.lcp-panel {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: var(--lcp-background);
}

.lcp-editor-panel {
  border-right: 1px solid var(--lcp-border);
}

.lcp-root[data-preview-hidden="true"] .lcp-editor-panel {
  border-right: none;
}

.lcp-tabs {
  display: flex;
  gap: 2px;
  padding: 6px 6px 0;
  background: var(--lcp-surface);
  border-bottom: 1px solid var(--lcp-border);
  flex-shrink: 0;
  overflow-x: auto;
}

.lcp-tab {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--lcp-muted);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  padding: 8px 14px;
  border-radius: 6px 6px 0 0;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.lcp-tab:hover {
  color: var(--lcp-text);
}

.lcp-tab[aria-selected="true"] {
  color: var(--lcp-text);
  background: var(--lcp-background);
  box-shadow: inset 0 -2px 0 var(--lcp-accent);
}

.lcp-tab:focus-visible {
  outline: 2px solid var(--lcp-accent);
  outline-offset: -2px;
}

.lcp-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: var(--lcp-surface);
  border-bottom: 1px solid var(--lcp-border);
  flex-shrink: 0;
}

.lcp-toolbar-actions {
  display: flex;
  gap: 8px;
}

.lcp-btn {
  appearance: none;
  border: 1px solid var(--lcp-border);
  background: var(--lcp-background);
  color: var(--lcp-text);
  font: inherit;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: transform 0.08s ease, filter 0.15s ease;
}

.lcp-btn:hover {
  filter: brightness(1.15);
}

.lcp-btn:active {
  transform: scale(0.97);
}

.lcp-btn:focus-visible {
  outline: 2px solid var(--lcp-accent);
  outline-offset: 1px;
}

.lcp-btn-run {
  background: var(--lcp-accent);
  border-color: transparent;
  color: white;
}

.lcp-status {
  font-size: 11.5px;
  color: var(--lcp-muted);
  white-space: nowrap;
}

.lcp-editor-wrap {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.lcp-editor {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  resize: none;
  border: none;
  outline: none;
  padding: 14px 16px;
  background: var(--lcp-background);
  color: var(--lcp-text);
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 14px;
  line-height: 1.6;
  tab-size: 2;
  display: none;
}

.lcp-editor[data-active="true"] {
  display: block;
}

.lcp-editor:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}

.lcp-console {
  flex-shrink: 0;
  max-height: 34%;
  min-height: 90px;
  border-top: 1px solid var(--lcp-border);
  background: var(--lcp-surface);
  display: flex;
  flex-direction: column;
}

.lcp-console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--lcp-muted);
  border-bottom: 1px solid var(--lcp-border);
  flex-shrink: 0;
}

.lcp-console-clear {
  appearance: none;
  border: none;
  background: transparent;
  color: var(--lcp-muted);
  font: inherit;
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline;
}

.lcp-console-body {
  overflow-y: auto;
  padding: 4px 12px 8px;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 12.5px;
}

.lcp-console-line {
  padding: 3px 0;
  border-bottom: 1px dashed var(--lcp-border);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--lcp-text);
}

.lcp-console-line:last-child {
  border-bottom: none;
}

.lcp-console-line[data-level="error"] {
  color: var(--lcp-danger);
}

.lcp-console-line[data-level="warn"] {
  color: #f59e0b;
}

.lcp-console-line[data-level="info"] {
  color: #38bdf8;
}

.lcp-console-empty {
  color: var(--lcp-muted);
  font-style: italic;
  padding: 6px 0;
}

.lcp-preview-panel {
  background: white;
}

.lcp-preview {
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  display: block;
}

.lcp-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}
`;
