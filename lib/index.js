// dsh-input-polish — DeepSeek Harness dual-face plugin.
//
// Host half:
//   1. Persisted settings namespace (`input-polish`) holding the user's
//      style (concise/detailed/formal/casual) and detail (3/5/expand).
//   2. `POST /api/input-polish/optimize` — polishes a draft with the
//      currently-selected model and returns the rewritten text.
//   3. `GET|POST /api/input-polish/settings` — read/update the persisted
//      preferences (used by the client settings section).
//
// The browser half ships via `exports["./client"]`; the client bundle is
// produced by build.mjs (esbuild → ModuleLoader handoff format).
import z from '@deepseek-ai/schemastery';
/** Cordis plugin name — must match the `name` in cordis.patch.yml. */
export const name = 'dsh-input-polish';
/** Services required by this plugin. */
export const inject = ['webServer', 'settings', 'agentDefaultModel'];
const STYLE_RULES = {
    concise: '表达要精炼克制：能一句话说清就不分点，最多 1~2 个要点，避免冗余。',
    detailed: '表达要详细完整：总述 + 分点补全关键需求细节。',
    formal: '语气正式专业：使用书面语，措辞严谨得体，适合正式场合或对外沟通。',
    casual: '语气口语自然：像日常对话一样轻松直白，避免生硬的书面腔。',
};
const DETAIL_RULES = {
    '3': '详细度：固定补全 3 个要点，每个要点一句话，点到为止。',
    '5': '详细度：固定补全 5 个要点，每个要点简明具体。',
    expand: '详细度：尽量充分展开，补全 6~8 个要点，每个要点可适当展开说明。',
};
function buildPrompt(style, detail) {
    const styleRule = STYLE_RULES[style] ?? STYLE_RULES.detailed;
    const detailRule = DETAIL_RULES[detail] ?? DETAIL_RULES['5'];
    return [
        '你是一位表达增强助手。用户输入的是 TA 想表达的一句话、一个想法或一个需求，你的任务是替 TA 把这个需求表达得完整、清晰、详细、可直接使用。',
        '',
        '核心原则：你是"替用户把话说好"，不是"替用户去向别人提问"。所有补全都必须以"用户想要什么"的方式写出（我希望…/请做到…/需满足…/包含…），绝不能以"请提供…/需要明确…"的方式向执行者索要信息。',
        '',
        '输出要求：',
        '1. 先给出一句总述，把用户的核心诉求说清楚（用"请帮我…"或第一人称陈述）。',
        '2. 然后分点补全用户省略但合理的需求细节：目标、风格、约束、边界、验收标准等。每一点都是陈述用户想要什么，措辞为"希望/要求/需做到/包含"，而不是"请提供/请告知"。',
        '3. ' + styleRule,
        '4. ' + detailRule,
        '5. 修正错别字、语法和标点。',
        '',
        '硬性禁止：',
        '- 禁止"需要明确以下信息""请提供""请告知""为了准确完成任务""如果没有偏好……"等反问、澄清或索要信息的句式。',
        '- 禁止输出解释、前言、说明或 Markdown 代码块（可以用 1. 2. 3. 这种纯文本编号）。',
        '- 忠于原意，不编造不存在的具体事实（风格、配色等细节是建议性默认，表述为"建议/可"而非既定事实）。',
        '- 保持原文语言（中文保持中文，英文保持英文，代码片段保持原样）。',
    ].join('\n');
}
function sendJson(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json' });
    res.end(JSON.stringify(body));
}
async function readJsonBody(req) {
    const chunks = [];
    for await (const chunk of req)
        chunks.push(chunk);
    const text = Buffer.concat(chunks).toString('utf-8');
    if (text.trim() === '')
        return {};
    return JSON.parse(text);
}
export function apply(ctx) {
    // Persisted preferences: schema defaults, then the user layer (survives restart).
    const settingsScope = ctx.settings.register('input-polish', z.object({
        style: z.string().default('detailed'),
        detail: z.string().default('5'),
    }));
    // ── optimize route ────────────────────────────────────────────────────────
    ctx.effect(() => ctx.webServer.register({
        kind: 'prefix',
        path: '/api/input-polish/optimize',
        handler: async (req, res) => {
            if (req.method !== 'POST')
                return sendJson(res, 405, { ok: false, error: 'method not allowed' });
            let body;
            try {
                body = await readJsonBody(req);
            }
            catch {
                return sendJson(res, 400, { ok: false, error: 'invalid json' });
            }
            const text = typeof body.text === 'string' ? body.text : '';
            const style = typeof body.style === 'string' ? body.style : 'detailed';
            const detail = typeof body.detail === 'string' ? body.detail : '5';
            if (text.trim() === '')
                return sendJson(res, 400, { ok: false, error: 'empty-input' });
            const llm = ctx.get('llm');
            if (llm === undefined)
                return sendJson(res, 500, { ok: false, error: 'llm-unavailable' });
            let provider = '';
            let model = '';
            try {
                const sel = ctx.agentDefaultModel.currentSelection();
                if (sel && typeof sel.provider === 'string' && typeof sel.model === 'string') {
                    provider = sel.provider;
                    model = sel.model;
                }
            }
            catch (err) {
                return sendJson(res, 500, { ok: false, error: 'no-model', message: String(err) });
            }
            if (provider === '' || model === '')
                return sendJson(res, 500, { ok: false, error: 'no-model' });
            const messages = [
                {
                    id: 'input-polish-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10),
                    role: 'user',
                    content: [{ type: 'text', text }],
                    source: { kind: 'user' },
                },
            ];
            try {
                const stream = llm.stream({
                    provider,
                    model,
                    system: buildPrompt(style, detail),
                    messages,
                    temperature: 0.5,
                    maxTokens: 4000,
                });
                let result = '';
                let finish = null;
                for await (const chunk of stream) {
                    if (chunk && chunk.type === 'text-delta' && typeof chunk.text === 'string')
                        result += chunk.text;
                    else if (chunk && chunk.type === 'finish')
                        finish = chunk.reason;
                }
                if (finish && finish.kind === 'aborted')
                    return sendJson(res, 500, { ok: false, error: 'aborted' });
                if (finish && finish.kind === 'error')
                    return sendJson(res, 500, { ok: false, error: 'model-error' });
                const polished = result.trim();
                if (polished === '')
                    return sendJson(res, 500, { ok: false, error: 'empty-result' });
                return sendJson(res, 200, { ok: true, text: polished });
            }
            catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                return sendJson(res, 500, { ok: false, error: 'stream-failed', message });
            }
        },
    }));
    // ── settings route ────────────────────────────────────────────────────────
    ctx.effect(() => ctx.webServer.register({
        kind: 'prefix',
        path: '/api/input-polish/settings',
        handler: async (req, res) => {
            if (req.method === 'GET') {
                return sendJson(res, 200, settingsScope.get());
            }
            if (req.method === 'POST') {
                let body;
                try {
                    body = await readJsonBody(req);
                }
                catch {
                    return sendJson(res, 400, { error: 'invalid json' });
                }
                try {
                    await settingsScope.update(body);
                    return sendJson(res, 200, settingsScope.get());
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : String(err);
                    return sendJson(res, 400, { error: message });
                }
            }
            return sendJson(res, 405, { error: 'method not allowed' });
        },
    }));
}
