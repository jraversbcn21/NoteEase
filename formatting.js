const NoteFormat = (function () {
    let editorEl = null;

    function init(editor) {
        editorEl = editor;
    }

    function getSelectionRange() {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return null;
        const range = sel.getRangeAt(0);
        if (!editorEl.contains(range.commonAncestorContainer)) return null;
        return range;
    }

    function findAncestorTag(node, tagName) {
        let current = node;
        while (current && current !== editorEl) {
            if (current.nodeType === Node.ELEMENT_NODE && current.tagName === tagName) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    function toggleInline(tagName) {
        const range = getSelectionRange();
        if (!range) return;

        const sel = window.getSelection();
        const ancestor = findAncestorTag(range.commonAncestorContainer, tagName);

        if (range.collapsed) {
            if (ancestor) {
                splitAndExit(ancestor, range);
            } else {
                const el = document.createElement(tagName);
                el.appendChild(document.createTextNode('​'));
                range.insertNode(el);
                const newRange = document.createRange();
                newRange.setStart(el.firstChild, 1);
                newRange.collapse(true);
                sel.removeAllRanges();
                sel.addRange(newRange);
            }
            return;
        }

        if (ancestor && isFullyWrapped(range, tagName)) {
            unwrapTag(range, tagName);
        } else {
            wrapSelection(range, tagName);
        }
    }

    function isFullyWrapped(range, tagName) {
        const fragment = range.cloneContents();
        const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
            if (node.textContent.trim() === '') continue;
            let parent = getOriginalParent(range, node);
            if (!findAncestorTag(parent, tagName)) return false;
        }
        return true;
    }

    function getOriginalParent(range, clonedTextNode) {
        const sel = window.getSelection();
        const startContainer = range.startContainer;
        if (startContainer.nodeType === Node.TEXT_NODE) {
            return startContainer.parentNode;
        }
        return startContainer;
    }

    function wrapSelection(range, tagName) {
        const sel = window.getSelection();
        const contents = range.extractContents();
        const wrapper = document.createElement(tagName);
        wrapper.appendChild(contents);
        range.insertNode(wrapper);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        sel.addRange(newRange);
    }

    function unwrapTag(range, tagName) {
        const sel = window.getSelection();
        const ancestor = findAncestorTag(range.commonAncestorContainer, tagName);
        if (!ancestor) return;

        const parent = ancestor.parentNode;
        while (ancestor.firstChild) {
            parent.insertBefore(ancestor.firstChild, ancestor);
        }
        parent.removeChild(ancestor);
        sel.removeAllRanges();
    }

    function splitAndExit(ancestor, range) {
        const sel = window.getSelection();
        const afterEl = document.createTextNode('​');
        ancestor.parentNode.insertBefore(afterEl, ancestor.nextSibling);
        const newRange = document.createRange();
        newRange.setStart(afterEl, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
    }

    function applyColor(color) {
        const range = getSelectionRange();
        if (!range) return;

        const sel = window.getSelection();

        if (range.collapsed) {
            const existingSpan = findColorSpan(range.commonAncestorContainer);
            if (existingSpan) {
                existingSpan.style.color = color;
                return;
            }
            const span = document.createElement('span');
            span.style.color = color;
            span.appendChild(document.createTextNode('​'));
            range.insertNode(span);
            const newRange = document.createRange();
            newRange.setStart(span.firstChild, 1);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            return;
        }

        const contents = range.extractContents();
        const span = document.createElement('span');
        span.style.color = color;
        span.appendChild(contents);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
    }

    function findColorSpan(node) {
        let current = node;
        while (current && current !== editorEl) {
            if (current.nodeType === Node.ELEMENT_NODE &&
                current.tagName === 'SPAN' &&
                current.style.color) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    function queryState(tagName) {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return false;
        const node = sel.anchorNode;
        return !!findAncestorTag(node, tagName);
    }

    function findBlockParent(node) {
        const blockTags = ['DIV', 'P', 'H1', 'H2', 'H3', 'LI', 'UL', 'OL', 'BLOCKQUOTE'];
        let current = node;
        while (current && current !== editorEl) {
            if (current.nodeType === Node.ELEMENT_NODE && blockTags.includes(current.tagName)) {
                return current;
            }
            current = current.parentNode;
        }
        return null;
    }

    function toggleBlock(tagName) {
        const range = getSelectionRange();
        if (!range) return;

        const sel = window.getSelection();
        let block = findBlockParent(range.startContainer);

        if (tagName === 'UL' || tagName === 'OL') {
            toggleList(block, tagName, sel);
            return;
        }

        if (!block || block === editorEl) {
            const newBlock = document.createElement(tagName);
            const contents = range.extractContents();
            newBlock.appendChild(contents);
            range.insertNode(newBlock);
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(newBlock);
            sel.addRange(newRange);
            return;
        }

        if (block.tagName === tagName) {
            const div = document.createElement('div');
            while (block.firstChild) {
                div.appendChild(block.firstChild);
            }
            block.parentNode.replaceChild(div, block);
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(div);
            sel.addRange(newRange);
        } else {
            const newBlock = document.createElement(tagName);
            while (block.firstChild) {
                newBlock.appendChild(block.firstChild);
            }
            block.parentNode.replaceChild(newBlock, block);
            sel.removeAllRanges();
            const newRange = document.createRange();
            newRange.selectNodeContents(newBlock);
            sel.addRange(newRange);
        }
    }

    function toggleList(block, listTag, sel) {
        if (block && block.tagName === 'LI' && block.parentNode.tagName === listTag) {
            const list = block.parentNode;
            const parent = list.parentNode;
            while (list.firstChild) {
                const li = list.firstChild;
                const div = document.createElement('div');
                while (li.firstChild) {
                    div.appendChild(li.firstChild);
                }
                parent.insertBefore(div, list);
                list.removeChild(li);
            }
            parent.removeChild(list);
            return;
        }

        const list = document.createElement(listTag);
        const li = document.createElement('li');

        if (block && block !== editorEl) {
            while (block.firstChild) {
                li.appendChild(block.firstChild);
            }
            list.appendChild(li);
            block.parentNode.replaceChild(list, block);
        } else {
            const range = getSelectionRange();
            if (!range) return;
            const contents = range.extractContents();
            li.appendChild(contents);
            list.appendChild(li);
            range.insertNode(list);
        }

        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(li);
        sel.addRange(newRange);
    }

    return {
        init: init,
        toggleInline: toggleInline,
        applyColor: applyColor,
        queryState: queryState,
        toggleBlock: toggleBlock
    };
})();
