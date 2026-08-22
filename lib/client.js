window.__ModuleLoader__.load({ id: "dsh-input-polish", factory: (require) => { var module = { exports: {} }; var exports = module.exports;
"use strict";
(() => {
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });

  // src/client/index.tsx
  var import_react = __require("react");
  var import_jsx_runtime = __require("react/jsx-runtime");
  var SOURCE_NAME = "dsh-input-polish";
  var STYLE_TAG = "dsh-input-polish/style.css";
  var STYLES = [
    { value: "concise", label: "\u7B80\u6D01" },
    { value: "detailed", label: "\u8BE6\u7EC6" },
    { value: "formal", label: "\u6B63\u5F0F" },
    { value: "casual", label: "\u53E3\u8BED" }
  ];
  var DETAILS = [
    { value: "3", label: "3 \u70B9" },
    { value: "5", label: "5 \u70B9" },
    { value: "expand", label: "\u66F4\u5C55\u5F00" }
  ];
  var style = "detailed";
  var detail = "5";
  var listeners = /* @__PURE__ */ new Set();
  function emit() {
    for (const fn of listeners) fn();
  }
  function subscribe(fn) {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }
  function setStyle(v) {
    style = v;
    emit();
    void saveSettings({ style: v });
  }
  function setDetail(v) {
    detail = v;
    emit();
    void saveSettings({ detail: v });
  }
  async function fetchSettings() {
    try {
      const res = await fetch("/api/input-polish/settings");
      if (!res.ok) return;
      const v = await res.json();
      if (typeof v.style === "string") style = v.style;
      if (typeof v.detail === "string") detail = v.detail;
      emit();
    } catch {
    }
  }
  async function saveSettings(patch) {
    try {
      await fetch("/api/input-polish/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch)
      });
    } catch {
    }
  }
  async function optimize(text, s, d) {
    const res = await fetch("/api/input-polish/optimize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, style: s, detail: d })
    });
    return await res.json();
  }
  function useSettings() {
    const [snap, setSnap] = (0, import_react.useState)({ style, detail });
    (0, import_react.useEffect)(() => subscribe(() => setSnap({ style, detail })), []);
    return snap;
  }
  function SparklesIcon() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M20 3v4" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M22 5h-4" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M4 17v2" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M5 18H3" })
    ] });
  }
  function SpinnerIcon() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2.5, strokeLinecap: "round", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 12, cy: 12, r: 9, opacity: 0.25 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", { d: "M21 12a9 9 0 0 0-9-9" })
    ] });
  }
  function AlertIcon() {
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true, children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", { cx: 12, cy: 12, r: 10 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: 12, y1: 8, x2: 12, y2: 12 }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("line", { x1: 12, y1: 16, x2: 12.01, y2: 16 })
    ] });
  }
  function SettingsPanel() {
    const s = useSettings();
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "ip-settings", children: [
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-settings-title", children: "\u8F93\u5165\u4F18\u5316" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-settings-desc", children: "\u70B9\u51FB\u8F93\u5165\u6846\u65C1\u7684 \u2728 \u6309\u94AE\u65F6\uFF0C\u6309\u4EE5\u4E0B\u8BBE\u7F6E\u589E\u5F3A\u8F93\u5165\u6587\u5B57\u3002" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-settings-label", children: "\u98CE\u683C" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-opt-row", children: STYLES.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: `ip-opt${it.value === s.style ? " is-active" : ""}`,
          onClick: () => setStyle(it.value),
          children: it.label
        },
        it.value
      )) }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-settings-label", children: "\u8BE6\u7EC6\u5EA6" }),
      /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "ip-opt-row", children: DETAILS.map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
        "button",
        {
          type: "button",
          className: `ip-opt${it.value === s.detail ? " is-active" : ""}`,
          onClick: () => setDetail(it.value),
          children: it.label
        },
        it.value
      )) })
    ] });
  }
  function PolishButton(props) {
    const s = useSettings();
    const [busy, setBusy] = (0, import_react.useState)(false);
    const [failed, setFailed] = (0, import_react.useState)(false);
    const onClick = () => {
      if (busy) return;
      const draft = props?.input?.draft;
      if (typeof draft !== "string" || draft.trim() === "") return;
      setBusy(true);
      setFailed(false);
      void optimize(draft, s.style, s.detail).then((res) => {
        if (res?.ok === true && typeof res.text === "string" && res.text.trim() !== "") {
          props?.inputActions?.setDraft?.(res.text);
        } else {
          setFailed(true);
        }
      }).catch(() => setFailed(true)).finally(() => setBusy(false));
    };
    const icon = busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SpinnerIcon, {}) : failed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertIcon, {}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SparklesIcon, {});
    const title = failed ? "\u4F18\u5316\u5931\u8D25\uFF0C\u70B9\u51FB\u91CD\u8BD5" : "\u589E\u5F3A\u8F93\u5165\u6587\u5B57";
    return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(
      "button",
      {
        type: "button",
        "data-input-polish": "",
        "data-state": failed ? "failed" : busy ? "busy" : "idle",
        onClick,
        disabled: busy,
        title,
        "aria-label": title,
        children: icon
      }
    );
  }
  function injectCss() {
    if (typeof document === "undefined") return;
    if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return;
    const tag = document.createElement("style");
    tag.dataset.plugin = SOURCE_NAME;
    tag.dataset.pluginCss = STYLE_TAG;
    tag.textContent = `
[data-input-polish]{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;padding:0;border:none;border-radius:6px;background:transparent;color:inherit;cursor:pointer;opacity:.72;transition:opacity .15s ease,background-color .15s ease}
[data-input-polish]:hover:not(:disabled){opacity:1;background-color:rgba(128,128,128,.16)}
[data-input-polish]:disabled{cursor:default;opacity:1}
[data-input-polish][data-state='busy'] svg{animation:input-polish-spin .8s linear infinite}
@keyframes input-polish-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.ip-settings{display:flex;flex-direction:column;gap:14px;max-width:480px;padding:4px 0}
.ip-settings-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary)}
.ip-settings-desc{font-size:12px;color:var(--dsw-alias-label-secondary);line-height:1.5}
.ip-settings-label{font-size:12px;color:var(--dsw-alias-label-secondary)}
.ip-opt-row{display:flex;flex-wrap:wrap;gap:8px}
.ip-opt{display:inline-flex;align-items:center;height:26px;padding:0 12px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:transparent;color:var(--dsw-alias-label-primary);font-size:12px;line-height:1;cursor:pointer;font-family:inherit}
.ip-opt:hover{background:var(--dsw-alias-bg-layer-2)}
.ip-opt.is-active{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-brand-primary)}
`;
    document.head.appendChild(tag);
  }
  function apply(ctx) {
    injectCss();
    void fetchSettings();
    ctx.slots.inject(
      "settings.section",
      () => ctx.slots.register(
        { name: "settings.section", id: "input-polish", order: 17, label: "\u8F93\u5165\u4F18\u5316" },
        SettingsPanel
      )
    );
    ctx.slots.inject(
      "conversation.input.right",
      () => ctx.slots.register(
        { name: "conversation.input.right", id: "input-polish" },
        PolishButton
      )
    );
  }
  if (typeof module !== "undefined" && module !== null) {
    module.exports = {
      apply,
      inject: ["slots"]
    };
  }
})();
return module.exports; } });
//# sourceMappingURL=client.js.map
