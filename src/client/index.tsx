// dsh-input-polish client face:
//   - a sparkles button beside the model selector (conversation.input.right)
//     that polishes the current draft via the host `/api/input-polish/optimize`
//   - a settings section (settings.section) for style + detail, persisted on
//     the host through `/api/input-polish/settings`

import { useEffect, useState } from 'react'

const SOURCE_NAME = 'dsh-input-polish'
const STYLE_TAG = 'dsh-input-polish/style.css'

const STYLES = [
  { value: 'concise', label: '简洁' },
  { value: 'detailed', label: '详细' },
  { value: 'formal', label: '正式' },
  { value: 'casual', label: '口语' },
]

const DETAILS = [
  { value: '3', label: '3 点' },
  { value: '5', label: '5 点' },
  { value: 'expand', label: '更展开' },
]

// ── shared, persisted preferences (backed by the host settings route) ──────
let style = 'detailed'
let detail = '5'
const listeners = new Set<() => void>()

function emit(): void {
  for (const fn of listeners) fn()
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

function setStyle(v: string): void {
  style = v
  emit()
  void saveSettings({ style: v })
}

function setDetail(v: string): void {
  detail = v
  emit()
  void saveSettings({ detail: v })
}

async function fetchSettings(): Promise<void> {
  try {
    const res = await fetch('/api/input-polish/settings')
    if (!res.ok) return
    const v = (await res.json()) as { style?: string; detail?: string }
    if (typeof v.style === 'string') style = v.style
    if (typeof v.detail === 'string') detail = v.detail
    emit()
  } catch {
    // keep defaults when the host route is unavailable
  }
}

async function saveSettings(patch: Record<string, string>): Promise<void> {
  try {
    await fetch('/api/input-polish/settings', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    })
  } catch {
    // non-fatal: next startup re-reads the persisted value
  }
}

interface OptimizeResult {
  ok?: boolean
  text?: string
  error?: string
}

async function optimize(text: string, s: string, d: string): Promise<OptimizeResult> {
  const res = await fetch('/api/input-polish/optimize', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text, style: s, detail: d }),
  })
  return (await res.json()) as OptimizeResult
}

function useSettings(): { style: string; detail: string } {
  const [snap, setSnap] = useState({ style, detail })
  useEffect(() => subscribe(() => setSnap({ style, detail })), [])
  return snap
}

// ── icons ───────────────────────────────────────────────────────────────────
function SparklesIcon(): JSX.Element {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  )
}

function SpinnerIcon(): JSX.Element {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden>
      <circle cx={12} cy={12} r={9} opacity={0.25} />
      <path d="M21 12a9 9 0 0 0-9-9" />
    </svg>
  )
}

function AlertIcon(): JSX.Element {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx={12} cy={12} r={10} />
      <line x1={12} y1={8} x2={12} y2={12} />
      <line x1={12} y1={16} x2={12.01} y2={16} />
    </svg>
  )
}

// ── settings section ────────────────────────────────────────────────────────
function SettingsPanel(): JSX.Element {
  const s = useSettings()
  return (
    <div className="ip-settings">
      <div className="ip-settings-title">输入优化</div>
      <div className="ip-settings-desc">点击输入框旁的 ✨ 按钮时，按以下设置增强输入文字。</div>
      <div className="ip-settings-label">风格</div>
      <div className="ip-opt-row">
        {STYLES.map((it) => (
          <button
            key={it.value}
            type="button"
            className={`ip-opt${it.value === s.style ? ' is-active' : ''}`}
            onClick={() => setStyle(it.value)}
          >
            {it.label}
          </button>
        ))}
      </div>
      <div className="ip-settings-label">详细度</div>
      <div className="ip-opt-row">
        {DETAILS.map((it) => (
          <button
            key={it.value}
            type="button"
            className={`ip-opt${it.value === s.detail ? ' is-active' : ''}`}
            onClick={() => setDetail(it.value)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── composer button ─────────────────────────────────────────────────────────
function PolishButton(props: any): JSX.Element {
  const s = useSettings()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)

  const onClick = (): void => {
    if (busy) return
    const draft: unknown = props?.input?.draft
    if (typeof draft !== 'string' || draft.trim() === '') return

    setBusy(true)
    setFailed(false)
    void optimize(draft, s.style, s.detail)
      .then((res) => {
        if (res?.ok === true && typeof res.text === 'string' && res.text.trim() !== '') {
          props?.inputActions?.setDraft?.(res.text)
        } else {
          setFailed(true)
        }
      })
      .catch(() => setFailed(true))
      .finally(() => setBusy(false))
  }

  const icon = busy ? <SpinnerIcon /> : failed ? <AlertIcon /> : <SparklesIcon />
  const title = failed ? '优化失败，点击重试' : '增强输入文字'

  return (
    <button
      type="button"
      data-input-polish=""
      data-state={failed ? 'failed' : busy ? 'busy' : 'idle'}
      onClick={onClick}
      disabled={busy}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  )
}

function injectCss(): void {
  if (typeof document === 'undefined') return
  if (document.querySelector(`style[data-plugin-css=${JSON.stringify(STYLE_TAG)}]`) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = SOURCE_NAME
  tag.dataset.pluginCss = STYLE_TAG
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
`
  document.head.appendChild(tag)
}

// ── plugin entry ────────────────────────────────────────────────────────────
export function apply(ctx: any): void {
  injectCss()
  void fetchSettings()

  ctx.slots.inject('settings.section', () =>
    ctx.slots.register(
      { name: 'settings.section', id: 'input-polish', order: 17, label: '输入优化' },
      SettingsPanel
    )
  )

  ctx.slots.inject('conversation.input.right', () =>
    ctx.slots.register(
      { name: 'conversation.input.right', id: 'input-polish' },
      PolishButton
    )
  )
}

// The client bundle must export the plugin object; esbuild iife does not write
// module.exports automatically, so assign it explicitly (banner defines the
// module variable at runtime).
declare const module: { exports: unknown } | undefined
if (typeof module !== 'undefined' && module !== null) {
  module.exports = {
    apply,
    inject: ['slots'],
  }
}
