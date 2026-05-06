# NoteEase

Extensión de Chrome (Manifest V3) para tomar notas rápidas desde el toolbar del navegador.

## Stack

- HTML/CSS/JS vanilla (sin frameworks ni bundler)
- Chrome Extensions API (Manifest V3)
- `chrome.storage.local` para persistencia

## Repositorio

- GitHub: https://github.com/jraversbcn21/NoteEase
- Branch principal: `master`
- Licencia: MIT

## Estructura

```
manifest.json      — Configuración de la extensión (v2.0)
popup.html         — UI del popup (editor + sidebar + toolbars)
popup.js           — Orquestador: conecta UI con módulos
formatting.js      — Motor de formateo (Selection/Range API)
notes.js           — Gestión de múltiples notas (CRUD + migración)
style.css          — Estilos con CSS custom properties (light/dark)
icons/             — Iconos 16/48/128 (png + ico)
screenshots/       — Capturas de pantalla (light.png, dark.png)
LICENSE            — MIT
README.md          — Documentación pública del proyecto
.gitignore         — Thumbs.db, .DS_Store, *.crx, node_modules
```

## Funcionalidades implementadas

- Editor contenteditable con persistencia automática via chrome.storage.local
- **Múltiples notas** con sidebar colapsable (crear, cambiar, eliminar)
- Migración automática desde v1.3 (nota única → esquema multi-nota)
- Formateo inline: negrita, cursiva, subrayado, tachado (via Selection/Range API)
- **Formateo de bloques**: H1, H2, listas con viñetas, listas numeradas
- Paleta de colores (rojo, azul, verde, negro/blanco) con indicador visual
- **Exportar como HTML** (preserva formato) o TXT (texto plano) via dropdown vertical
- **Atajos de teclado**: Ctrl+B (negrita), Ctrl+I (cursiva), Ctrl+U (subrayado)
- **Tema oscuro/claro** con toggle, persistencia y contraste adaptativo
  - Swap automático de colores inline al cambiar tema (negro ↔ blanco)
  - Paleta de colores se adapta al tema (swatch negro → blanco en dark mode)
  - Color activo por defecto se ajusta al tema
- Placeholder cuando el editor está vacío
- Estado activo de botones sincronizado con la selección

## Módulos

### formatting.js — NoteFormat
Motor de formateo que reemplaza `document.execCommand()` (deprecado):
- `init(editor)` — Inicializa con referencia al editor
- `toggleInline(tagName)` — Toggle de STRONG, EM, U, S
- `applyColor(color)` — Aplica color via span con style
- `queryState(tagName)` — Consulta si el cursor está dentro de un tag
- `toggleBlock(tagName)` — Toggle de H1, H2, UL, OL

### notes.js — NoteManager
Gestión de múltiples notas con migración:
- `init(callback)` — Carga notas, migra desde v1.3 si necesario
- `create()` / `delete(id)` — CRUD de notas
- `save(content)` / `getActive()` — Persistencia de nota activa
- `setActive(id)` — Cambiar nota activa

## Esquema de storage

```js
{
  notes: [{ id, title, content, createdAt, updatedAt }],
  activeNoteId: "note_...",
  theme: "light" | "dark"
}
```

## Comandos

No hay build ni dependencias. Para desarrollar:
1. Abrir `chrome://extensions/`
2. Activar "Developer mode"
3. "Load unpacked" apuntando a este directorio

## Permisos

- `storage` — guardar notas y preferencias (tema) localmente
