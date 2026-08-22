# dsh-input-polish

DeepSeek Harness（DSH）双面插件：在输入框模型选择器旁加一个「✨」按钮，用当前选中的模型把输入的文字增强得更完整、更清晰；并提供一个设置页，配置「风格」和「详细度」（持久化，重启不丢）。

[English](README.md) | 中文

## 功能

- **增强按钮**：聊天输入框工具行右端（模型选择器正左边）的闪星图标，点击后用当前模型润色当前输入，并把结果写回输入框。
- **设置页**：设置面板 →「输入优化」，可配置：
  - 风格：简洁 / 详细 / 正式 / 口语
  - 详细度：3 点 / 5 点 / 更展开
- **持久化**：风格与详细度写入 DSH 的 `settings` 服务，重启后保留。
- **失败态**：优化中显示旋转加载圈，失败显示感叹号（可点击重试）。

## 安装

### 1. 安装依赖并构建

```bash
npm install
npm run build
```

构建会产出：
- `lib/index.js` — host 半（Cordis 插件）
- `lib/client.js` — client 半（`window.__ModuleLoader__.load` 格式的浏览器 bundle）

### 2. 安装到你的 profile

```bash
dsh plugin --profile web add ../dsh-input-polish
```

或者手动：在你的 profile 的 `dsh.profile` 里把 `dsh-input-polish` 加入 `bundles`，并在 `cordis.patch.yml` 里确保它被加载。

### 3. 重启 DSH

重启后，输入框模型选择器旁应出现 ✨ 按钮，设置面板里出现「输入优化」页。

## 开发

```bash
npm run typecheck   # 类型检查
npm run build       # tsc 编译 host + esbuild 打包 client
```

## 发布到 GitHub

1. 在 GitHub 新建仓库 `dsh-input-polish`。
2. 把 `package.json` 里 `repository`/`homepage`/`bugs` 里的 `<your-username>` 改成你的用户名。
3. 推送代码。
4. 在仓库页面 **Add topic** 里添加 `dsh-plugin`（这样它会出现在 <https://github.com/topics/dsh-plugin>）。
5. （可选）发布到 npm：`npm publish`。

## License

MIT
