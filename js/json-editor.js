// JSON Editor Component

// ── SYNTAX HIGHLIGHT ──
function jeSyntaxHighlight(text) {
  // escape HTML first - comprehensive escaping
  let s = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // apply token colors in order
  s = s
    // strings — match quoted values (crude but effective for JSON)
    .replace(/"(\\.|[^"\\])*"/g, m => `<span class="s-str">${m}</span>`)
    // then re-color keys (string followed by colon)
    .replace(/<span class="s-str">("(?:\\.|[^"\\])*")<\/span>(\s*:)/g,
             (_, k, c) => `<span class="s-key">${k}</span>${c}`)
    // numbers
    .replace(/\b(-?\d+\.?\d*(?:[eE][+-]?\d+)?)\b/g, '<span class="s-num">$1</span>')
    // booleans
    .replace(/\b(true|false)\b/g, '<span class="s-bool">$1</span>')
    // null
    .replace(/\bnull\b/g, '<span class="s-null">null</span>')
    // braces / brackets
    .replace(/([{}\[\]])/g, '<span class="s-brace">$1</span>');

  return s;
}

// ── VALIDATE ──
let jeValidData = null;

function jeValidate(editor) {
  const val = editor.value.trim();
  const err = document.getElementById('err-msg');
  const ok  = document.getElementById('ok-msg');
  if (!val) { err.textContent = ''; ok.textContent = ''; jeValidData = null; return; }
  try {
    jeValidData = JSON.parse(val);
    err.textContent = '';
    ok.textContent = '✓ Valid JSON';
  } catch(e) {
    jeValidData = null;
    err.textContent = '✗ ' + e.message.split('\n')[0];
    ok.textContent = '';
  }
}

// ── STATS ──
function jeCountKeys(obj) {
  if (obj === null || typeof obj !== 'object') return 0;
  return Object.keys(obj).length +
    Object.values(obj).reduce((s, v) => s + jeCountKeys(v), 0);
}

function jeUpdateStats(editor) {
  const bytes = new Blob([editor.value]).size;
  document.getElementById('stat-size').textContent =
    bytes > 1024 ? (bytes/1024).toFixed(1) + ' KB' : bytes + ' B';
  const lines = editor.value.split('\n').length;
  document.getElementById('stat-lines').textContent =
    `${lines} line${lines !== 1 ? 's' : ''}`;
  if (jeValidData !== null) {
    document.getElementById('stat-keys').textContent =
      jeCountKeys(jeValidData) + ' keys';
  } else {
    document.getElementById('stat-keys').textContent = '–';
  }
}

// ── TOAST ──
function jeToast(msg, error = false) {
  const el = document.getElementById('toast');
  el.textContent = (error ? '⚠ ' : '✓ ') + msg;
  el.style.borderColor = error ? 'var(--je-red)' : 'var(--je-green)';
  el.style.color = error ? 'var(--je-red)' : 'var(--je-green)';
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2000);
}

// ── FORMAT ──
function jeFormat(editor) {
  if (!jeValidData) { jeToast('Fix JSON errors first', true); return; }
  editor.value = JSON.stringify(jeValidData, null, 2);
  jeOnInput(editor);
  jeToast('Formatted!');
}

// ── LOAD FILE ──
function jeLoadFile(e, editor) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    editor.value = ev.target.result;
    jeOnInput(editor);
    jeFormat(editor);
    jeToast('Loaded: ' + file.name);
  };
  reader.onerror = () => jeToast('Failed to read file', true);
  reader.readAsText(file);
  e.target.value = '';
}

// ── COPY ──
function jeCopy(editor) {
  if (!editor.value) return jeToast('Nothing to copy', true);
  navigator.clipboard.writeText(editor.value)
    .then(() => jeToast('Copied!'))
    .catch(() => jeToast('Copy failed', true));
}

// ── DOWNLOAD ──
function jeDownload(editor) {
  if (!editor.value) return jeToast('Nothing to save', true);
  const blob = new Blob([editor.value], { type: 'application/json' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = 'data.json';
  a.click();
  URL.revokeObjectURL(url); // Clean up to prevent memory leak
  jeToast('Saved!');
}

// ── TAB KEY ──
function jeHandleKey(e, editor) {
  if (e.key === 'Tab') {
    e.preventDefault();
    const s = editor.selectionStart;
    const end = editor.selectionEnd;
    editor.value = editor.value.substring(0, s) + '  ' + editor.value.substring(end);
    editor.selectionStart = editor.selectionEnd = s + 2;
    jeOnInput(editor);
  }
  // Ctrl/Cmd+S → save
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    jeDownload(editor);
  }
  // Ctrl/Cmd+Shift+F → format
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
    e.preventDefault();
    jeFormat(editor);
  }
}

// ── UPDATE HIGHLIGHT ──
function jeUpdateHighlight(editor, highlight) {
  const val = editor.value;
  highlight.innerHTML = jeSyntaxHighlight(val) + '\n';
}

// ── SYNC SCROLL ──
function jeSyncScroll(editor, highlight) {
  highlight.scrollTop  = editor.scrollTop;
  highlight.scrollLeft = editor.scrollLeft;
}

// ── INPUT HANDLER ──
function jeOnInput(editor) {
  const highlight = document.getElementById('highlight');
  jeUpdateHighlight(editor, highlight);
  jeValidate(editor);
  jeUpdateStats(editor);
}

// ── INITIALIZE ──
function jeInit(containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) {
    console.error('JSON Editor: Container not found:', containerId);
    return;
  }
  
  container.innerHTML = `
    <header>
      <span class="logo">{ } JSON</span>
      <div class="spacer"></div>
      <label class="btn" title="Load a .json file">
        ↑ Load
        <input type="file" accept=".json" id="je-file-input" />
      </label>
      <button class="btn" id="je-btn-format" title="Format / prettify JSON">⇄ Format</button>
      <button class="btn" id="je-btn-copy" title="Copy to clipboard">⎘ Copy</button>
      <button class="btn dl" id="je-btn-download" title="Download as .json">↓ Save</button>
    </header>
    <div class="statusbar">
      <span id="stat-lines">1 line</span>
      <span id="stat-size">0 B</span>
      <span id="stat-keys">–</span>
      <span id="err-msg"></span>
      <span id="ok-msg"></span>
    </div>
    <div class="editor-wrap">
      <div id="highlight" aria-hidden="true"></div>
      <textarea id="editor"
        spellcheck="false"
        autocorrect="off"
        autocapitalize="off"
        placeholder="Paste or type JSON here..."
      ></textarea>
    </div>
    <div id="toast"></div>
  `;

  const editor = document.getElementById('editor');
  const highlight = document.getElementById('highlight');
  const fileInput = document.getElementById('je-file-input');
  const formatBtn = document.getElementById('je-btn-format');
  const copyBtn = document.getElementById('je-btn-copy');
  const downloadBtn = document.getElementById('je-btn-download');

  // Attach event listeners
  editor.addEventListener('input', () => jeOnInput(editor));
  editor.addEventListener('scroll', () => jeSyncScroll(editor, highlight));
  editor.addEventListener('keydown', (e) => jeHandleKey(e, editor));
  
  fileInput.addEventListener('change', (e) => jeLoadFile(e, editor));
  formatBtn.addEventListener('click', () => jeFormat(editor));
  copyBtn.addEventListener('click', () => jeCopy(editor));
  downloadBtn.addEventListener('click', () => jeDownload(editor));
  
  // drag & drop
  container.addEventListener('dragover', e => e.preventDefault());
  container.addEventListener('drop', e => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      editor.value = ev.target.result;
      jeOnInput(editor);
      jeFormat(editor);
      jeToast('Loaded: ' + file.name);
    };
    reader.readAsText(file);
  });

  editor.focus();
}

// Export for external use
window.JSONEditor = {
  init: jeInit,
  getValue: function() {
    const editor = document.getElementById('editor');
    return editor ? editor.value : '';
  },
  setValue: function(value) {
    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = value;
      jeOnInput(editor);
    }
  },
  onInput: jeOnInput
};