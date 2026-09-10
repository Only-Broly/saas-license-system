(function(c,d){typeof exports=="object"&&typeof module<"u"?d(exports):typeof define=="function"&&define.amd?define(["exports"],d):(c=typeof globalThis<"u"?globalThis:c||self,d(c.LiveCodePlayground={}))})(this,(function(c){"use strict";class d{listeners={};on(e,t){return this.listeners[e]||(this.listeners[e]=new Set),this.listeners[e].add(t),()=>this.off(e,t)}off(e,t){this.listeners[e]?.delete(t)}emit(e,t){this.listeners[e]?.forEach(o=>{try{o(t)}catch(i){console.error("[live-code-playground] listener error:",i)}})}clear(){this.listeners={}}}const v=`
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
`;function p(r,e){const t=new RegExp(`</${e}`,"gi");return r.replace(t,`<\\/${e}`)}function w(r,e,t){const o=p(r??"","script"),i=p(e??"","style"),n=p(t??"","script");return`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="referrer" content="no-referrer" />
    <style>
      html, body { margin: 0; padding: 8px; font-family: system-ui, sans-serif; color: #111; }
    </style>
    <style>${i}</style>
    <script>${v}<\/script>
  </head>
  <body>
    ${o}
    <script>
      try {
        ${n}
      } catch (e) {
        parent.postMessage({ __lcp: true, type: "error", payload: { message: e.message, stack: e.stack, source: "runtime" } }, "*");
      }
    <\/script>
  </body>
</html>`}const E=`
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
`,m=["html","css","javascript"],f={html:"HTML",css:"CSS",javascript:"JS"},x={dark:{accent:"#6366f1",background:"#0f1115",surface:"#171a21",border:"rgba(255, 255, 255, 0.12)",text:"#e7e9ee",muted:"#8b93a1",radius:"10px"},light:{accent:"#6366f1",background:"#ffffff",surface:"#f4f5f7",border:"rgba(15, 17, 21, 0.12)",text:"#14161a",muted:"#5b6370",radius:"10px"}};let g=0;function C(r){return g+=1,`${r}-${Date.now().toString(36)}-${g}`}function k(){try{if(typeof crypto<"u"&&"randomUUID"in crypto)return crypto.randomUUID()}catch{}return C("lcp")}function L(r){const e=r.languages&&r.languages.length>0?r.languages.filter(i=>m.includes(i)):m,t=r.activeLanguage&&e.includes(r.activeLanguage)?r.activeLanguage:e[0],o=typeof r.height=="number"?`${r.height}px`:r.height||"480px";return{languages:e,activeLanguage:t,theme:r.theme==="light"?"light":"dark",colors:r.colors||{},fontSize:r.editor?.fontSize??14,readOnly:r.editor?.readOnly??!1,autoRun:r.preview?.autoRun??!0,debounce:r.preview?.debounce??400,previewVisible:r.preview?.visible??!0,showRun:r.controls?.run??!0,showReset:r.controls?.reset??!0,showConsole:r.controls?.console??!0,persistenceEnabled:r.persistence?.enabled??!1,persistenceKey:r.persistence?.key??null,height:o}}const S={html:"<h1>Hello world</h1>",css:`h1 {
  color: #6366f1;
  font-family: sans-serif;
}`,javascript:"console.log('Hello from the playground!');"};class b{container;cfg;emitter=new d;initialCode;code;activeLanguage;destroyed=!1;debounceTimer=null;storageKey=null;root;tabsEl;editorWrap;editors=new Map;tabs=new Map;runBtn;resetBtn;statusEl;consoleBody;previewPanel;iframe;onMessage=e=>{if(!this.iframe||e.source!==this.iframe.contentWindow)return;const t=e.data;!t||typeof t!="object"||!t.__lcp||(t.type==="console"?this.appendConsoleLine(t.payload):t.type==="error"&&(this.appendConsoleLine({level:"error",args:[t.payload?.message||"Runtime error"],timestamp:Date.now()}),this.emitter.emit("error",{message:t.payload?.message||"Runtime error",stack:t.payload?.stack,source:"runtime"})))};constructor(e,t){this.container=e,this.cfg=L(t),this.initialCode={...S,...t.code||{}},this.code={...this.initialCode},this.activeLanguage=this.cfg.activeLanguage,this.cfg.persistenceEnabled&&(this.storageKey=`lcp:${this.cfg.persistenceKey||k()}`,this.loadPersisted()),this.render(),this.applyColors(this.cfg.colors),window.addEventListener("message",this.onMessage),this.cfg.autoRun&&this.run(),Promise.resolve().then(()=>{this.destroyed||this.emitter.emit("ready",{code:this.getCode()})})}render(){this.container.innerHTML="";const e=document.createElement("style");e.textContent=E,this.container.appendChild(e),this.root=document.createElement("div"),this.root.className="lcp-root",this.root.dataset.theme=this.cfg.theme,this.root.style.height=this.cfg.height,this.cfg.previewVisible||(this.root.dataset.previewHidden="true");const t=document.createElement("div");t.className="lcp-panel lcp-editor-panel",this.tabsEl=document.createElement("div"),this.tabsEl.className="lcp-tabs",this.tabsEl.setAttribute("role","tablist"),this.tabsEl.setAttribute("aria-label","Playground languages"),this.cfg.languages.forEach(n=>{const s=document.createElement("button");s.type="button",s.className="lcp-tab",s.textContent=f[n],s.setAttribute("role","tab"),s.setAttribute("aria-selected",String(n===this.activeLanguage)),s.addEventListener("click",()=>this.selectLanguage(n)),this.tabsEl.appendChild(s),this.tabs.set(n,s)});const o=document.createElement("div");o.className="lcp-toolbar";const i=document.createElement("div");if(i.className="lcp-toolbar-actions",this.runBtn=document.createElement("button"),this.runBtn.type="button",this.runBtn.className="lcp-btn lcp-btn-run",this.runBtn.textContent="▶ Run",this.runBtn.style.display=this.cfg.showRun?"":"none",this.runBtn.addEventListener("click",()=>this.run()),this.resetBtn=document.createElement("button"),this.resetBtn.type="button",this.resetBtn.className="lcp-btn lcp-btn-reset",this.resetBtn.textContent="↺ Reset",this.resetBtn.style.display=this.cfg.showReset?"":"none",this.resetBtn.addEventListener("click",()=>this.reset()),i.appendChild(this.runBtn),i.appendChild(this.resetBtn),this.statusEl=document.createElement("span"),this.statusEl.className="lcp-status",this.statusEl.textContent=this.cfg.readOnly?"Read-only":"",o.appendChild(i),o.appendChild(this.statusEl),this.editorWrap=document.createElement("div"),this.editorWrap.className="lcp-editor-wrap",this.cfg.languages.forEach(n=>{const s=document.createElement("textarea");s.className="lcp-editor",s.spellcheck=!1,s.setAttribute("aria-label",`${f[n]} code editor`),s.value=this.code[n]??"",s.style.fontSize=`${this.cfg.fontSize}px`,s.disabled=this.cfg.readOnly,s.dataset.active=String(n===this.activeLanguage),s.addEventListener("input",()=>this.handleInput(n,s.value)),s.addEventListener("keydown",a=>this.handleEditorKeydown(a,s)),this.editorWrap.appendChild(s),this.editors.set(n,s)}),t.appendChild(this.tabsEl),t.appendChild(o),t.appendChild(this.editorWrap),this.cfg.showConsole){const n=document.createElement("div");n.className="lcp-console";const s=document.createElement("div");s.className="lcp-console-header";const a=document.createElement("span");a.textContent="Console";const l=document.createElement("button");l.type="button",l.className="lcp-console-clear",l.textContent="Clear",l.addEventListener("click",()=>this.clearConsole()),s.appendChild(a),s.appendChild(l),this.consoleBody=document.createElement("div"),this.consoleBody.className="lcp-console-body",this.renderEmptyConsole(),n.appendChild(s),n.appendChild(this.consoleBody),t.appendChild(n)}this.root.appendChild(t),this.previewPanel=document.createElement("div"),this.previewPanel.className="lcp-panel lcp-preview-panel",this.previewPanel.style.display=this.cfg.previewVisible?"":"none",this.iframe=document.createElement("iframe"),this.iframe.className="lcp-preview",this.iframe.setAttribute("sandbox","allow-scripts"),this.iframe.setAttribute("title","Live preview"),this.iframe.setAttribute("referrerpolicy","no-referrer"),this.previewPanel.appendChild(this.iframe),this.root.appendChild(this.previewPanel),this.container.appendChild(this.root)}handleEditorKeydown(e,t){if(e.key!=="Tab"||this.cfg.readOnly)return;e.preventDefault();const o=t.selectionStart,i=t.selectionEnd,n=t.value;t.value=`${n.slice(0,o)}  ${n.slice(i)}`,t.selectionStart=t.selectionEnd=o+2,t.dispatchEvent(new Event("input"))}selectLanguage(e){this.activeLanguage!==e&&(this.activeLanguage=e,this.tabs.forEach((t,o)=>t.setAttribute("aria-selected",String(o===e))),this.editors.forEach((t,o)=>t.setAttribute("data-active",String(o===e))))}loadPersisted(){if(this.storageKey)try{const e=window.localStorage.getItem(this.storageKey);if(!e)return;const t=JSON.parse(e);t&&typeof t=="object"&&(this.code={...this.initialCode,...t})}catch{}}persist(){if(this.storageKey)try{window.localStorage.setItem(this.storageKey,JSON.stringify(this.code))}catch{}}handleInput(e,t){this.code[e]=t,this.persist(),this.emitter.emit("change",{language:e,code:this.getCode()}),this.cfg.autoRun&&this.scheduleRun()}scheduleRun(){this.debounceTimer&&clearTimeout(this.debounceTimer),this.debounceTimer=setTimeout(()=>this.run(),this.cfg.debounce)}renderEmptyConsole(){if(!this.consoleBody)return;this.consoleBody.innerHTML="";const e=document.createElement("div");e.className="lcp-console-empty",e.textContent="Console output will appear here.",this.consoleBody.appendChild(e)}appendConsoleLine(e){if(!this.consoleBody)return;this.consoleBody.querySelector(".lcp-console-empty")&&(this.consoleBody.innerHTML="");const t=document.createElement("div");t.className="lcp-console-line",t.dataset.level=e.level,t.textContent=(e.args||[]).join(" "),this.consoleBody.appendChild(t),this.consoleBody.scrollTop=this.consoleBody.scrollHeight,this.emitter.emit("console",{level:e.level||"log",args:e.args||[],timestamp:e.timestamp||Date.now()})}clearConsole(){this.renderEmptyConsole()}applyColors(e){const o={...x[this.cfg.theme],...e},i={"--lcp-accent":o.accent,"--lcp-background":o.background,"--lcp-surface":o.surface,"--lcp-border":o.border,"--lcp-text":o.text,"--lcp-muted":o.muted,"--lcp-radius":o.radius};Object.entries(i).forEach(([n,s])=>{this.container.style.setProperty(n,s)})}run(){if(this.destroyed)return;this.debounceTimer&&(clearTimeout(this.debounceTimer),this.debounceTimer=null);const e=w(this.code.html||"",this.code.css||"",this.code.javascript||"");this.cfg.previewVisible&&this.iframe.setAttribute("srcdoc",e),this.emitter.emit("run",{code:this.getCode()})}reset(){this.destroyed||(this.code={...this.initialCode},this.editors.forEach((e,t)=>{e.value=this.code[t]??""}),this.persist(),this.emitter.emit("reset",{code:this.getCode()}),this.cfg.autoRun&&this.run())}getCode(){return{...this.code}}setCode(e,t){this.destroyed||(Object.entries(e).forEach(([o,i])=>{if(typeof i!="string")return;const n=o;this.code[n]=i;const s=this.editors.get(n);s&&(s.value=i)}),this.persist(),this.emitter.emit("change",{language:this.activeLanguage,code:this.getCode()}),(t?.run??this.cfg.autoRun)&&this.run())}setTheme(e){this.destroyed||(this.cfg.theme=e==="light"?"light":"dark",this.root.dataset.theme=this.cfg.theme,this.applyColors(this.cfg.colors))}on(e,t){return this.emitter.on(e,t)}off(e,t){this.emitter.off(e,t)}destroy(){this.destroyed||(this.destroyed=!0,this.debounceTimer&&clearTimeout(this.debounceTimer),window.removeEventListener("message",this.onMessage),this.emitter.emit("destroy",{}),this.emitter.clear(),this.container.innerHTML="",this.editors.clear(),this.tabs.clear())}}const h="live-code-playground",T=["ready","change","run","reset","error","console"];class y extends HTMLElement{core=null;mountPoint;pendingConfig=null;constructor(){super();const e=this.attachShadow({mode:"open"});this.mountPoint=document.createElement("div"),e.appendChild(this.mountPoint)}connectedCallback(){if(this.core)return;if(this.pendingConfig){this.initialize(this.pendingConfig);return}const e=this.readConfigAttribute();e&&this.initialize(e)}disconnectedCallback(){this.destroy()}readConfigAttribute(){const e=this.getAttribute("config");if(!e)return null;try{return JSON.parse(e)}catch{return console.error("[live-code-playground] invalid `config` attribute JSON"),null}}configure(e){if(!this.isConnected){this.pendingConfig=e;return}this.initialize(e)}initialize(e){this.core&&(this.core.destroy(),this.core=null),this.core=new b(this.mountPoint,e),T.forEach(t=>{this.core.on(t,o=>{this.dispatchEvent(new CustomEvent(`lcp-${t}`,{detail:o,bubbles:!0,composed:!0}))})})}run(){this.core?.run()}reset(){this.core?.reset()}getCode(){return this.core?.getCode()}setCode(e,t){this.core?.setCode(e,t)}setTheme(e){this.core?.setTheme(e)}onPlaygroundEvent(e,t){return this.core?this.core.on(e,t):()=>{}}offPlaygroundEvent(e,t){this.core?.off(e,t)}destroy(){this.core?.destroy(),this.core=null}}function u(r=h){typeof window>"u"||typeof customElements>"u"||customElements.get(r)||customElements.define(r,y)}function B(r){if(!r)throw new Error("[live-code-playground] `target` is required — pass a CSS selector or a DOM element.");if(typeof r=="string"){const e=document.querySelector(r);if(!e)throw new Error(`[live-code-playground] no element matches selector "${r}"`);return e}return r}function P(r){const e=r.tag||h;u(e);const t=B(r.target);t.innerHTML="";const o=document.createElement(e);t.appendChild(o),o.configure(r);const i=new WeakMap;return{run:()=>o.run(),reset:()=>o.reset(),getCode:()=>o.getCode()??{},setCode:(s,a)=>o.setCode(s,a),setTheme:s=>o.setTheme(s),on:(s,a)=>{const l=(A=>a(A.detail));return i.set(a,l),o.addEventListener(`lcp-${s}`,l),()=>o.removeEventListener(`lcp-${s}`,l)},off:(s,a)=>{const l=i.get(a);l&&(o.removeEventListener(`lcp-${s}`,l),i.delete(a))},destroy:()=>{o.destroy(),o.remove()},element:o}}typeof window<"u"&&u(),c.DEFAULT_TAG_NAME=h,c.LiveCodePlaygroundElement=y,c.PlaygroundCore=b,c.createPlayground=P,c.registerLiveCodePlayground=u,Object.defineProperty(c,Symbol.toStringTag,{value:"Module"})}));
//# sourceMappingURL=live-code-playground.js.map
