const NoteManager = (function () {
    let notes = [];
    let activeNoteId = null;
    let onChangeCallback = null;

    function init(callback) {
        onChangeCallback = callback;
        return new Promise(function (resolve) {
            chrome.storage.local.get(['notes', 'activeNoteId', 'notepadContent'], function (result) {
                if (result.notes && result.notes.length > 0) {
                    notes = result.notes;
                    activeNoteId = result.activeNoteId || notes[0].id;
                } else if (result.notepadContent) {
                    const now = Date.now();
                    notes = [{
                        id: 'note_' + now,
                        title: 'Mi nota',
                        content: result.notepadContent,
                        createdAt: now,
                        updatedAt: now
                    }];
                    activeNoteId = notes[0].id;
                    chrome.storage.local.remove('notepadContent');
                    persist();
                } else {
                    const now = Date.now();
                    notes = [{
                        id: 'note_' + now,
                        title: 'Mi nota',
                        content: '',
                        createdAt: now,
                        updatedAt: now
                    }];
                    activeNoteId = notes[0].id;
                    persist();
                }
                resolve(getActive());
            });
        });
    }

    function persist() {
        chrome.storage.local.set({ notes: notes, activeNoteId: activeNoteId });
    }

    function getAll() {
        return notes.slice();
    }

    function getActive() {
        return notes.find(function (n) { return n.id === activeNoteId; }) || notes[0];
    }

    function getActiveId() {
        return activeNoteId;
    }

    function save(content) {
        const note = getActive();
        if (!note) return;
        note.content = content;
        note.updatedAt = Date.now();
        note.title = extractTitle(content);
        persist();
    }

    function extractTitle(html) {
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = (div.textContent || div.innerText || '').trim();
        if (!text) return 'Sin título';
        return text.substring(0, 30) + (text.length > 30 ? '...' : '');
    }

    function create() {
        const now = Date.now();
        const note = {
            id: 'note_' + now,
            title: 'Sin título',
            content: '',
            createdAt: now,
            updatedAt: now
        };
        notes.unshift(note);
        activeNoteId = note.id;
        persist();
        if (onChangeCallback) onChangeCallback();
        return note;
    }

    function deleteNote(id) {
        if (notes.length <= 1) return false;
        notes = notes.filter(function (n) { return n.id !== id; });
        if (activeNoteId === id) {
            activeNoteId = notes[0].id;
        }
        persist();
        if (onChangeCallback) onChangeCallback();
        return true;
    }

    function setActive(id) {
        const note = notes.find(function (n) { return n.id === id; });
        if (!note) return null;
        activeNoteId = id;
        persist();
        if (onChangeCallback) onChangeCallback();
        return note;
    }

    return {
        init: init,
        getAll: getAll,
        getActive: getActive,
        getActiveId: getActiveId,
        save: save,
        create: create,
        delete: deleteNote,
        setActive: setActive
    };
})();
