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

把粘贴进 Notion 的纯文本 LaTeX 公式一键转成原生公式块或行内公式。自动判断块级/行内，接管 `Ctrl+Shift+E`，支持选区、当前行和全文档三级范围，顶部胶囊提示进度。

## 安装

装好 Violentmonkey / Tampermonkey 后，点击 **[安装脚本](https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js)** 并确认即可。

## 支持的写法

| 写法 | 转换结果 |
| ---- | ---- |
| `$$...$$` / `\[...\]` | 块级公式 |
| `$...$` / `\(...\)` | 行内公式 |

块级公式只在「独占一个段落」时生效，否则自动退回行内，保证位置不错乱。

## 用法

粘贴公式 → 选好范围 → 按 `Ctrl+Shift+E`（Mac：`Cmd+Shift+E`）。

有选区只处理选区；光标停在公式行处理当前行；其余情况扫全文档。公式从后往前转换，较多时请等待提示条消失再继续编辑。

## 隐私

脚本只在 `app.notion.com` 内运行，不发起网络请求，不读取、不外传笔记内容，也不写入本地存储。

## 关于

- 作者为 [LINUX DO](https://linux.do) 社区成员，感谢社区的认可与支持。
- 发现问题欢迎提交 [Issue](https://github.com/teressalodas/Notion-Formula-Auto-Conversion/issues)，也欢迎 PR / Star。
- 请遵守 Notion 的服务条款。

## 许可证

[Apache License 2.0](./LICENSE)
