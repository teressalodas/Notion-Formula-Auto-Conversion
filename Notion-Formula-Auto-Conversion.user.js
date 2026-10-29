// ==UserScript==
// @name         Notion Formula Auto Conversion
// @namespace    https://github.com/teressalodas/Notion-Formula-Auto-Conversion
// @version      3.0
// @description  Notion 公式智能脱壳转换（支持块级/行内自动区分、Ctrl+Shift+E 智能接管、顶部极简状态提示）
// @description:en-US  Convert pasted LaTeX into native Notion equations — auto block/inline detection, Ctrl+Shift+E takeover, minimal top indicator
// @author       teressalodas
// @homepageURL  https://github.com/teressalodas/Notion-Formula-Auto-Conversion
// @supportURL   https://github.com/teressalodas/Notion-Formula-Auto-Conversion/issues
// @updateURL    https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js
// @downloadURL  https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/Notion-Formula-Auto-Conversion.user.js
// @icon         https://raw.githubusercontent.com/teressalodas/Notion-Formula-Auto-Conversion/main/icon.png
// @match        https://app.notion.com/*
// @grant        GM_addStyle
// @license      Apache License 2.0
// ==/UserScript==

(function () {
    'use strict';

    const FORCE_LANG = null;
    const SUPPORTED_LANGS = ['zh', 'en'];

    const I18N = {
        zh: {
            mode: {
                selection: '选区',
                line: '当前行',
                document: '全文档'
            },
            noFormula: '未检测到待转换的公式',
            progress: (mode, done, total) => `[${mode}] 正在转换公式 (${done}/${total})...`,
            finished: n => `转换完成，共处理 ${n} 个公式`,
            failed: msg => `转换出错: ${msg}`,
            logPrefix: '[Notion Formula Auto Conversion] 转换异常:'
        },
        en: {
            mode: {
                selection: 'Selection',
                line: 'Current line',
                document: 'Whole document'
            },
            noFormula: 'No formulas found to convert',
            progress: (mode, done, total) => `[${mode}] Converting (${done}/${total})…`,
            finished: n => `Done — ${n} formula${n === 1 ? '' : 's'} converted`,
            failed: msg => `Conversion failed: ${msg}`,
            logPrefix: '[Notion Formula Auto Conversion] Conversion error:'
        }
    };

    function detectLang() {
        if (FORCE_LANG && SUPPORTED_LANGS.includes(FORCE_LANG)) return FORCE_LANG;

        const candidates = [navigator.language]
            .concat(navigator.languages || [])
            .concat(navigator.userLanguage || [])
            .filter(Boolean);

        for (const tag of candidates) {
            const lower = String(tag).toLowerCase();
            if (lower.indexOf('zh') === 0) return 'zh';
            if (lower.indexOf('en') === 0) return 'en';
        }
        return 'zh';
    }

    const LANG = detectLang();
    const T = I18N[LANG];

    GM_addStyle(`
        #nf-toast {
            position: fixed;
            top: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            z-index: 999999;
            background: rgba(255, 255, 255, 0.96);
            color: #37352f;
            padding: 6px 14px;
            border-radius: 999px;
            font-size: 13px;
            font-weight: 500;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, sans-serif;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(15, 15, 15, 0.06);
            display: flex;
            align-items: center;
            gap: 8px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            backdrop-filter: blur(8px);
        }
        .notion-dark-theme #nf-toast {
            background: rgba(37, 37, 37, 0.96);
            color: rgba(255, 255, 255, 0.88);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
        }
        #nf-toast.visible {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        #nf-toast-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: #2563eb;
            flex: 0 0 auto;
        }
        #nf-toast.processing #nf-toast-dot {
            animation: nf-pulse 1s infinite ease-in-out;
        }
        #nf-toast.done #nf-toast-dot {
            background: #10b981;
        }
        #nf-toast.warn #nf-toast-dot {
            background: #f59e0b;
        }
        @keyframes nf-pulse {
            0%, 100% { transform: scale(0.85); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
        }
    `);

    let isProcessing = false;
    let toastEl, toastTextEl, hideTimer;

    function showToast(text, state = 'processing', autoHideMs = 0) {
        if (!toastEl) {
            toastEl = document.createElement('div');
            toastEl.id = 'nf-toast';
            toastEl.innerHTML = `<span id="nf-toast-dot"></span><span id="nf-toast-text"></span>`;
            document.body.appendChild(toastEl);
            toastTextEl = toastEl.querySelector('#nf-toast-text');
        }
        clearTimeout(hideTimer);
        toastTextEl.textContent = text;
        toastEl.className = `visible ${state}`;

        if (autoHideMs > 0) {
            hideTimer = setTimeout(() => {
                toastEl.classList.remove('visible');
            }, autoHideMs);
        }
    }

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    const FORMULA_REGEX = /\$\$([\s\S]+?)\$\$|\\\[([\s\S]+?)\\\]|\$([^\$\n]+?)\$|\\\(([\s\S]+?)\\\)/g;

    function parseFormulas(text) {
        const results = [];
        const regex = new RegExp(FORMULA_REGEX.source, 'g');
        let match;
        while ((match = regex.exec(text)) !== null) {
            const fullMatch = match[0];
            const isBlock = match[1] !== undefined || match[2] !== undefined;
            const rawInner = match[1] ?? match[2] ?? match[3] ?? match[4] ?? '';
            const inner = rawInner.trim();
            if (inner) {
                results.push({
                    fullMatch,
                    inner,
                    isBlock,
                    index: match.index
                });
            }
        }
        return results;
    }

    function isInvalidContext(node) {
        const el = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
        if (!el) return true;
        return Boolean(
            el.closest('.notion-code-block') ||
            el.closest('.notion-equation-block') ||
            el.closest('[data-content-editable-void="true"]') ||
            el.closest('.notion-overlay-container')
        );
    }

    async function simulateClick(element) {
        const rect = element.getBoundingClientRect();
        const clientX = rect.left + rect.width / 2;
        const clientY = rect.top + rect.height / 2;
        const opts = { bubbles: true, cancelable: true, clientX, clientY };

        element.dispatchEvent(new MouseEvent('mousemove', opts));
        element.dispatchEvent(new MouseEvent('mouseenter', opts));
        element.dispatchEvent(new MouseEvent('mousedown', opts));
        await sleep(15);
        element.dispatchEvent(new MouseEvent('mouseup', opts));
        element.dispatchEvent(new MouseEvent('click', opts));
    }

    function dispatchKey(target, key, code, keyCode, extra = {}) {
        const init = {
            key,
            code,
            keyCode,
            which: keyCode,
            bubbles: true,
            cancelable: true,
            composed: true,
            ...extra
        };
        target.dispatchEvent(new KeyboardEvent('keydown', init));
        target.dispatchEvent(new KeyboardEvent('keyup', init));
    }

    async function triggerNotionInlineShortcut() {
        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const target = document.activeElement || document.body;
        dispatchKey(target, 'E', 'KeyE', 69, {
            ctrlKey: !isMac,
            metaKey: isMac,
            shiftKey: true
        });
        await sleep(60);
    }

    const CONFIRM_LABELS = ['完成', '保存', 'Done', 'Save'];

    async function confirmFormulaDialog() {
        for (let i = 0; i < 18; i++) {
            const overlay = document.querySelector('.notion-overlay-container');
            if (overlay) {
                const buttons = overlay.querySelectorAll('[role="button"], button');
                for (const btn of buttons) {
                    const txt = btn.textContent.trim();
                    if (CONFIRM_LABELS.some(label => txt === label || txt.includes(label))) {
                        await simulateClick(btn);
                        return true;
                    }
                }
            }
            await sleep(60);
        }
        if (document.activeElement) {
            dispatchKey(document.activeElement, 'Enter', 'Enter', 13);
            return true;
        }
        return false;
    }

    async function fillBlockEquationModal(latexContent) {
        for (let i = 0; i < 20; i++) {
            const overlay = document.querySelector('.notion-overlay-container');
            if (overlay) {
                const input = overlay.querySelector('textarea, input, [contenteditable="true"]');
                if (input) {
                    input.focus();
                    await sleep(30);
                    document.execCommand('insertText', false, latexContent);
                    await sleep(50);
                    await confirmFormulaDialog();
                    return true;
                }
            }
            await sleep(60);
        }
        return false;
    }

    async function convertToBlockEquation(editorEl, item) {
        editorEl.focus();
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(editorEl);
        selection.removeAllRanges();
        selection.addRange(range);
        await sleep(30);

        document.execCommand('insertText', false, '/math');
        await sleep(220);

        dispatchKey(document.activeElement || editorEl, 'Enter', 'Enter', 13);
        await sleep(120);

        const filled = await fillBlockEquationModal(item.inner);
        if (!filled) {
            document.execCommand('selectAll', false, null);
            document.execCommand('insertText', false, item.inner);
            await sleep(40);
            await triggerNotionInlineShortcut();
            await confirmFormulaDialog();
        }
        await sleep(80);
    }

    async function convertToInlineEquation(editorEl, item) {
        const walker = document.createTreeWalker(editorEl, NodeFilter.SHOW_TEXT, {
            acceptNode: n => isInvalidContext(n) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT
        });

        const matchingNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.includes(item.fullMatch)) {
                matchingNodes.push(node);
            }
        }

        if (!matchingNodes.length) return false;

        const targetNode = matchingNodes[matchingNodes.length - 1];
        const startIdx = targetNode.textContent.lastIndexOf(item.fullMatch);
        if (startIdx === -1) return false;

        const range = document.createRange();
        range.setStart(targetNode, startIdx);
        range.setEnd(targetNode, startIdx + item.fullMatch.length);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        editorEl.focus();
        await sleep(30);

        document.execCommand('insertText', false, item.inner);
        await sleep(30);

        const anchorNode = selection.anchorNode;
        if (anchorNode && anchorNode.nodeType === Node.TEXT_NODE) {
            const endOffset = selection.anchorOffset;
            const beginOffset = Math.max(0, endOffset - item.inner.length);
            const cleanRange = document.createRange();
            cleanRange.setStart(anchorNode, beginOffset);
            cleanRange.setEnd(anchorNode, endOffset);
            selection.removeAllRanges();
            selection.addRange(cleanRange);
        }

        await sleep(30);

        await triggerNotionInlineShortcut();
        await confirmFormulaDialog();
        await sleep(80);
        return true;
    }

    async function processEditorBlock(editorEl, formulas) {
        const fullBlockText = editorEl.textContent.trim();
        if (formulas.length === 1 && formulas[0].isBlock && fullBlockText === formulas[0].fullMatch.trim()) {
            await convertToBlockEquation(editorEl, formulas[0]);
            return 1;
        }

        let count = 0;
        const reversed = [...formulas].reverse();
        for (const item of reversed) {
            const ok = await convertToInlineEquation(editorEl, item);
            if (ok) count++;
        }
        return count;
    }

    function collectTasks() {
        const selection = window.getSelection();

        if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
            const selectedText = selection.toString();
            const selectedFormulas = parseFormulas(selectedText);

            if (selectedFormulas.length === 0) {
                return null;
            }

            const range = selection.getRangeAt(0);
            const allEditors = Array.from(document.querySelectorAll('[contenteditable="true"]'))
                .filter(el => !isInvalidContext(el) && range.intersectsNode(el));

            const tasks = [];
            for (const editor of allEditors) {
                const f = parseFormulas(editor.textContent);
                if (f.length > 0) tasks.push({ editor, formulas: f });
            }
            return { mode: 'selection', tasks };
        }

        if (selection && selection.anchorNode) {
            const currentEditor = (selection.anchorNode.nodeType === Node.ELEMENT_NODE
                ? selection.anchorNode
                : selection.anchorNode.parentElement)?.closest('[contenteditable="true"]');

            if (currentEditor && !isInvalidContext(currentEditor)) {
                const formulas = parseFormulas(currentEditor.textContent);
                if (formulas.length > 0) {
                    return { mode: 'line', tasks: [{ editor: currentEditor, formulas }] };
                }
            }
        }

        const editors = Array.from(document.querySelectorAll('[contenteditable="true"]'))
            .filter(el => !isInvalidContext(el));

        const tasks = [];
        for (const editor of editors) {
            const formulas = parseFormulas(editor.textContent);
            if (formulas.length > 0) {
                tasks.push({ editor, formulas });
            }
        }
        return { mode: 'document', tasks };
    }

    async function runConversion(taskBundle) {
        if (isProcessing) return;
        isProcessing = true;

        try {
            const { mode, tasks } = taskBundle;
            const modeLabel = T.mode[mode] || T.mode.document;
            const totalFormulas = tasks.reduce((sum, t) => sum + t.formulas.length, 0);

            if (totalFormulas === 0) {
                showToast(T.noFormula, 'warn', 1800);
                return;
            }

            let converted = 0;
            showToast(T.progress(modeLabel, 0, totalFormulas), 'processing');

            for (const { editor, formulas } of [...tasks].reverse()) {
                const doneInBlock = await processEditorBlock(editor, formulas);
                converted += doneInBlock;
                showToast(T.progress(modeLabel, converted, totalFormulas), 'processing');
            }

            showToast(T.finished(converted), 'done', 2000);
        } catch (err) {
            console.error(T.logPrefix, err);
            showToast(T.failed(err.message), 'warn', 3000);
        } finally {
            isProcessing = false;
        }
    }

    document.addEventListener('keydown', function (e) {
        if (!e.isTrusted) return;

        const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
        const modKey = isMac ? e.metaKey : e.ctrlKey;

        if (modKey && e.shiftKey && e.key.toLowerCase() === 'e') {
            const taskBundle = collectTasks();
            if (taskBundle === null) return;

            e.preventDefault();
            e.stopPropagation();
            runConversion(taskBundle);
        }
    }, true);

})();
