# NoteEase

Extensión de Chrome (Manifest V3) para tomar notas rápidas desde el toolbar del navegador.

## Stack

- HTML/CSS/JS vanilla (sin frameworks ni bundler)
- Chrome Extensions API (Manifest V3)
- `chrome.storage.local` para persistencia

## Estructura

```
manifest.json      — Configuración de la extensión (v1.3)
popup.html         — UI del popup (editor + toolbar)
popup.js           — Lógica: formateo, paleta de colores, guardado
style.css          — Estilos del popup (400×600px)
icons/             — Iconos 16/48/128 (png + ico)
```

## Funcionalidades implementadas

- Editor contenteditable con persistencia automática via chrome.storage.local
- Formateo de texto: negrita, cursiva, subrayado, tachado
- Paleta de colores (rojo, azul, verde, negro) con indicador visual
- Exportar nota como archivo .txt (descarga con confirm dialog)
- Placeholder cuando el editor está vacío
- Estado activo de botones de formato sincronizado con la selección

## Comandos

No hay build ni dependencias. Para desarrollar:
1. Abrir `chrome://extensions/`
2. Activar "Developer mode"
3. "Load unpacked" apuntando a este directorio

## Permisos

- `storage` — guardar el contenido de las notas localmente
