<div align="center">  
  <img src="./icon.png" width="100" height="100" alt="Notion Formula Auto Conversion">  
  <h1>Notion Formula Auto Conversion</h1>  
</div>

<p align="center">  
  <a href="https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js">  
    <img src="https://img.shields.io/badge/GitHub-%E5%AE%89%E8%A3%85%E8%84%9A%E6%9C%AC-red?style=for-the-badge&logo=github" alt="安装脚本" />
  </a>  
  <a href="./LICENSE">  
    <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge" alt="License: Apache License 2.0" />  
  </a>  
</p>

<p align="center">简体中文 | <a href="./README.en.md">English</a></p>

Notion Formula Auto Conversion 是一款免费开源的用户脚本，把粘贴进 Notion 的纯文本 LaTeX 公式一键转成 Notion 原生公式块或行内公式。脚本会自动判断该用块级还是行内，接管 `Ctrl+Shift+E` 这组快捷键，支持选区、当前行和全文档三级范围，并在页面顶部用一个极简胶囊提示进度。

## 安装

先安装 Violentmonkey 或 Tampermonkey（Chrome / Edge / Firefox），然后点击下方链接，并在弹窗中确认安装：

**[安装 Notion Formula Auto Conversion](https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js)**

## 支持的写法

| 写法        | 转换结果 |
| --------- | ---- |
| `$$...$$` | 块级公式 |
| `\[...\]` | 块级公式 |
| `$...$`   | 行内公式 |
| `\(...\)` | 行内公式 |

块级公式只在「公式独占一个段落」时才会转成公式块；如果这一行里还夹着别的文字，它会退回成行内公式，保证内容和位置不错乱。

## 功能

- **自动脱壳**：剥掉 `$`、`$$`、`\(`、`\)` 等外壳，只把 LaTeX 正文交给 Notion。
- **块级 / 行内自动区分**：整行只有一条块级公式时走公式块，其余情况一律按行内处理。
- **接管 `Ctrl+Shift+E`**：只在检测到公式时才拦截，其余时候把快捷键完整还给 Notion。
- **三级作用范围**：选中一段就从选区里找，光标停在某行就只处理当前行，什么都不选就扫全文档。
- **顶部极简提示**：胶囊状态条显示「正在转换 (3/12)」，结束变绿点，没找到公式或出错变橙点后自动消失。
- **跳过不该碰的地方**：代码块、已有公式块、非文本容器和弹窗内部都会被排除。
- **防重复触发**：转换过程中再次按快捷键会被忽略，不会叠着跑。
- **明暗主题自适应**：跟随 Notion 深色模式自动切换提示条配色。

## 使用方法

把带 LaTeX 的文本粘贴进 Notion，选好范围后按 `Ctrl+Shift+E`（Mac 为 `Cmd+Shift+E`），剩下的交给脚本：

| 触发时的状态         | 处理范围           |
| -------------- | -------------- |
| 有非折叠选区，且其中包含公式 | 选区（只动选区命中的编辑器） |
| 无选区，光标停在某段公式里  | 当前行            |
| 其余情况           | 全文档            |

转换是逐条执行的：块级公式会先输入 `/math` 唤起公式块再填入 LaTeX，行内公式则替换成 LaTeX 正文、选中后触发 Notion 自带的公式快捷键。为了不让位置错位，公式是从后往前处理的。

## 注意事项

- 脚本靠模拟真实输入和快捷键完成转换，转换期间请不要切换页面或点击其他位置，否则焦点丢失会中断流程。
- 公式较多时需要逐条等待，看到提示条消失再继续编辑。
- 已经转换好的公式不会被二次处理，重复执行是安全的。

## 隐私与安全

- 脚本只在 `app.notion.com` 页面内运行，所有操作都在你自己的浏览器里完成。
- 不发起任何网络请求，不读取也不外传你的笔记内容。
- 没有设置项，不写入本地存储，提示条随页面关闭消失。

## 关于

- 脚本通过页面结构与模拟输入定位目标，Notion 改版可能导致快捷键接管或弹窗确认失效，请保持脚本更新。
- 如果发现问题，请提交 [GitHub Issue](https://github.com/teressalodas/Notion-Formula-Auto-Conversion/issues)，并注明浏览器和问题现象。
- 欢迎提交 Pull Request。如果觉得好用，欢迎给仓库点 Star。
- 请遵守 Notion 的服务条款。

## 许可证

本项目基于 [Apache License 2.0](./LICENSE) 开源。
