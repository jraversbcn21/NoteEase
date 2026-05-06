document.addEventListener('DOMContentLoaded', function () {
    // Get references to buttons and editor
    const boldBtn = document.getElementById('boldBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const italicBtn = document.getElementById('italicBtn');
    const strikethroughBtn = document.getElementById('strikethroughBtn');
    const textColorBtn = document.getElementById('textColorBtn');
    const colorPalette = document.getElementById('colorPalette');
    const colorIndicator = document.getElementById('colorIndicator');
    const saveBtn = document.getElementById('saveBtn');
    const editor = document.getElementById('editor');

    // Update button active states based on current cursor/selection formatting
    function updateButtonStates() {
        boldBtn.classList.toggle('active', document.queryCommandState('bold'));
        underlineBtn.classList.toggle('active', document.queryCommandState('underline'));
        italicBtn.classList.toggle('active', document.queryCommandState('italic'));
        strikethroughBtn.classList.toggle('active', document.queryCommandState('strikeThrough'));
    }

    // Prevent editor from losing focus when clicking formatting buttons
    [boldBtn, underlineBtn, italicBtn, strikethroughBtn, textColorBtn].forEach(function (btn) {
        btn.addEventListener('mousedown', function (e) {
            e.preventDefault();
        });
    });

    // Event Listeners for Basic Text Editing
    boldBtn.addEventListener('click', function () {
        document.execCommand('bold', false, null);
        boldBtn.classList.toggle('active');
    });

    // Función para guardar la nota como archivo .txt
    saveBtn.addEventListener('click', function () {
        // Mostrar advertencia al usuario
        const confirmSave = confirm("Warning: The note will be saved as plain text (.txt). Do you want to continue?");

        // Si el usuario confirma, procede a guardar
        if (confirmSave) {
            const textContent = editor.innerText; // Obtiene el texto del editor
            const blob = new Blob([textContent], { type: 'text/plain' }); // Crea un archivo blob
            const url = URL.createObjectURL(blob); // Genera una URL para el archivo

            // Crea un enlace temporal para descargar
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Note saved.txt'; // Nombre predeterminado del archivo
            document.body.appendChild(a);
            a.click(); // Activa la descarga
            document.body.removeChild(a);

            // Limpia la URL después de descargar
            setTimeout(() => URL.revokeObjectURL(url), 100);
        }
    });

    underlineBtn.addEventListener('click', function () {
        document.execCommand('underline', false, null);
        underlineBtn.classList.toggle('active');
    });

    // Event Listeners for Advanced Formatting
    italicBtn.addEventListener('click', function () {
        document.execCommand('italic', false, null);
        italicBtn.classList.toggle('active');
    });

    strikethroughBtn.addEventListener('click', function () {
        document.execCommand('strikeThrough', false, null);
        strikethroughBtn.classList.toggle('active');
    });

    let activeColor = '#1a1a1a';
    document.execCommand('foreColor', false, activeColor);
    textColorBtn.classList.add('active');
    colorIndicator.style.backgroundColor = activeColor;

    // Toggle color palette visibility
    textColorBtn.addEventListener('click', function () {
        colorPalette.classList.toggle('hidden');
    });

    // Prevent editor from losing focus when interacting with the palette
    colorPalette.addEventListener('mousedown', function (e) {
        e.preventDefault();
    });

    // Apply color when a swatch is clicked
    colorPalette.querySelectorAll('.color-swatch').forEach(function (swatch) {
        swatch.addEventListener('click', function () {
            activeColor = swatch.dataset.color;
            document.execCommand('foreColor', false, activeColor);
            colorPalette.classList.add('hidden');
            textColorBtn.classList.add('active');
            colorIndicator.style.backgroundColor = activeColor;
        });
    });

    // Re-apply active color when the cursor is repositioned
    editor.addEventListener('mouseup', function () {
        if (activeColor) {
            document.execCommand('foreColor', false, activeColor);
        }
    });

    // Re-apply active color before each keystroke so new text keeps the color
    editor.addEventListener('keydown', function () {
        if (activeColor) {
            document.execCommand('foreColor', false, activeColor);
        }
    });

    // Close palette when clicking outside
    document.addEventListener('click', function (e) {
        if (!textColorBtn.contains(e.target) && !colorPalette.contains(e.target)) {
            colorPalette.classList.add('hidden');
        }
    });

    // Save and Load Content Using Local Storage
    const saveContent = () => {
        const content = editor.innerHTML;
        chrome.storage.local.set({ 'notepadContent': content }, function () {
            // Optionally, notify the user that content is saved
            // console.log('Notes saved.');
        });
    };

    const PLACEHOLDER = "Write your notes here...";

    const loadContent = () => {
        chrome.storage.local.get(['notepadContent'], function (result) {
            if (result.notepadContent) {
                editor.innerHTML = result.notepadContent;
            } else {
                editor.innerHTML = PLACEHOLDER;
                editor.classList.add('placeholder');
            }
        });
    };

    editor.addEventListener('focus', function () {
        if (editor.classList.contains('placeholder')) {
            editor.innerHTML = '';
            editor.classList.remove('placeholder');
        }
    });

    // Save content on input
    editor.addEventListener('input', saveContent);

    // Load content on initialization
    loadContent();

    // Listen for cursor movements and key presses to update button states
    editor.addEventListener('keyup', updateButtonStates);
    editor.addEventListener('mouseup', updateButtonStates);
});
