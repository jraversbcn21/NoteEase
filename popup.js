document.addEventListener('DOMContentLoaded', function () {
    const boldBtn = document.getElementById('boldBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const italicBtn = document.getElementById('italicBtn');
    const strikethroughBtn = document.getElementById('strikethroughBtn');
    const textColorBtn = document.getElementById('textColorBtn');
    const colorPalette = document.getElementById('colorPalette');
    const colorIndicator = document.getElementById('colorIndicator');
    const saveBtn = document.getElementById('saveBtn');
    const editor = document.getElementById('editor');

    NoteFormat.init(editor);

    function updateButtonStates() {
        boldBtn.classList.toggle('active', NoteFormat.queryState('STRONG') || NoteFormat.queryState('B'));
        underlineBtn.classList.toggle('active', NoteFormat.queryState('U'));
        italicBtn.classList.toggle('active', NoteFormat.queryState('EM') || NoteFormat.queryState('I'));
        strikethroughBtn.classList.toggle('active', NoteFormat.queryState('S') || NoteFormat.queryState('STRIKE'));
    }

    [boldBtn, underlineBtn, italicBtn, strikethroughBtn, textColorBtn].forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
        });
    });

    boldBtn.addEventListener('click', function () {
        NoteFormat.toggleInline('STRONG');
        updateButtonStates();
    });

    underlineBtn.addEventListener('click', function () {
        NoteFormat.toggleInline('U');
        updateButtonStates();
    });

    italicBtn.addEventListener('click', function () {
        NoteFormat.toggleInline('EM');
        updateButtonStates();
    });

    strikethroughBtn.addEventListener('click', function () {
        NoteFormat.toggleInline('S');
        updateButtonStates();
    });

    let activeColor = '#1a1a1a';
    colorIndicator.style.backgroundColor = activeColor;

    textColorBtn.addEventListener('click', function () {
        colorPalette.classList.toggle('hidden');
    });

    colorPalette.addEventListener('mousedown', function (e) {
        e.preventDefault();
    });

    colorPalette.querySelectorAll('.color-swatch').forEach(function (swatch) {
        swatch.addEventListener('click', function () {
            activeColor = swatch.dataset.color;
            NoteFormat.applyColor(activeColor);
            colorPalette.classList.add('hidden');
            colorIndicator.style.backgroundColor = activeColor;
        });
    });

    document.addEventListener('click', function (e) {
        if (!textColorBtn.contains(e.target) && !colorPalette.contains(e.target)) {
            colorPalette.classList.add('hidden');
        }
    });

    // Keyboard shortcuts
    editor.addEventListener('keydown', function (e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'b':
                    e.preventDefault();
                    NoteFormat.toggleInline('STRONG');
                    updateButtonStates();
                    break;
                case 'i':
                    e.preventDefault();
                    NoteFormat.toggleInline('EM');
                    updateButtonStates();
                    break;
                case 'u':
                    e.preventDefault();
                    NoteFormat.toggleInline('U');
                    updateButtonStates();
                    break;
            }
        }
    });

    // Notes management
    const PLACEHOLDER = "Escribe tus notas aquí...";
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const newNoteBtn = document.getElementById('newNoteBtn');
    const noteList = document.getElementById('noteList');

    function renderNoteList() {
        const notes = NoteManager.getAll();
        const activeId = NoteManager.getActiveId();
        noteList.innerHTML = '';
        notes.forEach(function (note) {
            const item = document.createElement('div');
            item.className = 'note-item' + (note.id === activeId ? ' active' : '');
            const title = document.createElement('span');
            title.className = 'note-title';
            title.textContent = note.title || 'Sin título';
            title.addEventListener('click', function () {
                NoteManager.save(editor.innerHTML);
                const selected = NoteManager.setActive(note.id);
                if (selected) {
                    editor.innerHTML = selected.content || '';
                    showPlaceholderIfEmpty();
                }
            });
            item.appendChild(title);
            if (notes.length > 1) {
                const delBtn = document.createElement('button');
                delBtn.className = 'note-delete';
                delBtn.textContent = '×';
                delBtn.title = 'Eliminar nota';
                delBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (confirm('¿Eliminar esta nota?')) {
                        NoteManager.delete(note.id);
                        const active = NoteManager.getActive();
                        editor.innerHTML = active.content || '';
                        showPlaceholderIfEmpty();
                    }
                });
                item.appendChild(delBtn);
            }
            noteList.appendChild(item);
        });
    }

    function showPlaceholderIfEmpty() {
        if (!editor.textContent.trim()) {
            editor.innerHTML = PLACEHOLDER;
            editor.classList.add('placeholder');
        } else {
            editor.classList.remove('placeholder');
        }
    }

    sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('hidden');
        renderNoteList();
    });

    newNoteBtn.addEventListener('click', function () {
        NoteManager.save(editor.innerHTML);
        NoteManager.create();
        editor.innerHTML = '';
        showPlaceholderIfEmpty();
        editor.focus();
    });

    NoteManager.init(renderNoteList).then(function (activeNote) {
        if (activeNote && activeNote.content) {
            editor.innerHTML = activeNote.content;
        } else {
            editor.innerHTML = PLACEHOLDER;
            editor.classList.add('placeholder');
        }
    });

    editor.addEventListener('focus', function () {
        if (editor.classList.contains('placeholder')) {
            editor.innerHTML = '';
            editor.classList.remove('placeholder');
        }
    });

    editor.addEventListener('input', function () {
        NoteManager.save(editor.innerHTML);
    });

    editor.addEventListener('keyup', updateButtonStates);
    editor.addEventListener('mouseup', updateButtonStates);

    // Export functionality
    saveBtn.addEventListener('click', function () {
        const saveDropdown = document.getElementById('saveDropdown');
        saveDropdown.classList.toggle('hidden');
    });

    document.getElementById('saveTxt').addEventListener('click', function () {
        const textContent = editor.innerText;
        const blob = new Blob([textContent], { type: 'text/plain' });
        downloadBlob(blob, 'NoteEase.txt');
        document.getElementById('saveDropdown').classList.add('hidden');
    });

    document.getElementById('saveHtml').addEventListener('click', function () {
        const htmlContent = '<!DOCTYPE html>\n<html><head><meta charset="UTF-8"><title>NoteEase</title>' +
            '<style>body{font-family:Arial,sans-serif;padding:20px;max-width:800px;margin:auto}</style>' +
            '</head><body>' + editor.innerHTML + '</body></html>';
        const blob = new Blob([htmlContent], { type: 'text/html' });
        downloadBlob(blob, 'NoteEase.html');
        document.getElementById('saveDropdown').classList.add('hidden');
    });

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    document.addEventListener('click', function (e) {
        const saveDropdown = document.getElementById('saveDropdown');
        if (!saveBtn.contains(e.target) && !saveDropdown.contains(e.target)) {
            saveDropdown.classList.add('hidden');
        }
    });

    // Block formatting buttons
    const h1Btn = document.getElementById('h1Btn');
    const h2Btn = document.getElementById('h2Btn');
    const ulBtn = document.getElementById('ulBtn');
    const olBtn = document.getElementById('olBtn');

    [h1Btn, h2Btn, ulBtn, olBtn].forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
        });
    });

    h1Btn.addEventListener('click', function () {
        NoteFormat.toggleBlock('H1');
    });
    h2Btn.addEventListener('click', function () {
        NoteFormat.toggleBlock('H2');
    });
    ulBtn.addEventListener('click', function () {
        NoteFormat.toggleBlock('UL');
    });
    olBtn.addEventListener('click', function () {
        NoteFormat.toggleBlock('OL');
    });

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const darkColors = ['#1a1a1a', '#000000', '#000', '#333', '#333333'];
    const lightColor = '#1a1a1a';
    const darkColor = '#e0e0e0';
    const blackSwatch = colorPalette.querySelector('[data-color="#1a1a1a"]');

    function isDarkMode() {
        return document.documentElement.getAttribute('data-theme') === 'dark';
    }

    function getDefaultColor() {
        return isDarkMode() ? darkColor : lightColor;
    }

    function updatePaletteSwatch() {
        if (!blackSwatch) return;
        if (isDarkMode()) {
            blackSwatch.dataset.color = darkColor;
            blackSwatch.style.backgroundColor = darkColor;
            blackSwatch.title = 'Blanco';
        } else {
            blackSwatch.dataset.color = lightColor;
            blackSwatch.style.backgroundColor = lightColor;
            blackSwatch.title = 'Negro';
        }
    }

    function normalizeColor(color) {
        if (!color) return null;
        const temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);
        const computed = getComputedStyle(temp).color;
        document.body.removeChild(temp);
        return computed;
    }

    function swapEditorColors(fromColors, toColor) {
        const normalizedFrom = fromColors.map(normalizeColor);
        const normalizedTo = normalizeColor(toColor);

        editor.querySelectorAll('font[color], span[style*="color"]').forEach(function (el) {
            let elColor;
            if (el.tagName === 'FONT' && el.getAttribute('color')) {
                elColor = normalizeColor(el.getAttribute('color'));
                if (normalizedFrom.includes(elColor)) {
                    el.setAttribute('color', toColor);
                }
            }
            if (el.style && el.style.color) {
                elColor = normalizeColor(el.style.color);
                if (normalizedFrom.includes(elColor)) {
                    el.style.color = toColor;
                }
            }
        });
    }

    function applyTheme(dark) {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeToggle.textContent = '☀';
            swapEditorColors(darkColors, darkColor);
        } else {
            document.documentElement.removeAttribute('data-theme');
            themeToggle.textContent = '☾';
            swapEditorColors([darkColor, '#e0e0e0'], lightColor);
        }
        updatePaletteSwatch();
        activeColor = getDefaultColor();
        colorIndicator.style.backgroundColor = activeColor;
    }

    chrome.storage.local.get(['theme'], function (result) {
        if (result.theme === 'dark') {
            applyTheme(true);
        }
    });

    themeToggle.addEventListener('click', function () {
        const wasDark = isDarkMode();
        applyTheme(!wasDark);
        chrome.storage.local.set({ theme: wasDark ? 'light' : 'dark' });
        NoteManager.save(editor.innerHTML);
    });
});
