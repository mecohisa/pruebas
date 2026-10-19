# Skeleton Dance: personaje vectorial reutilizable

La entrega principal es ahora **un único esqueleto articulado con fondo
transparente**, en SVG y PNG. La versión anterior de la escena completa se
conserva en `scene.html` como referencia.

```sh
npm start
```

La página principal abre el estudio del personaje. No hay dependencias de frontend
que instalar. Incluye reproducción, búsqueda por pose, secuencias, color de huesos y
contorno, fondos para probar transparencia y exportación SVG/PNG.

## Recursos

- `character/skeleton-animated.svg`: animación autónoma, sin imágenes incrustadas.
- `character/skeleton.svg`: figura vectorial estática.
- `character/poses/`: 660 poses SVG con fondo transparente.
- `character/png/`: 660 poses PNG RGBA de 600×760.
- `character/skeleton-poses.zip`: paquete de recursos del personaje.
- `character/motion.mjs`, `keyframes.json`: poses y movimiento editables.
- `character/skeleton.mjs`: API de dibujo y animación.
- `character/README.md`: instrucciones, ejemplos y limitaciones de fidelidad.

El personaje se reconstruyó a partir de 44 poses clave del corte aportado por el
usuario. La figura frontal se limpió/redibujó y se trazó en vector; el movimiento
se reconstruyó manualmente. Las 660 muestras incluyen poses interpoladas: no son
660 calcos ni máscaras exactas de la película. Todos los recursos finales del
personaje son independientes del escenario y de los otros esqueletos.

La escena anterior usa 660 fotogramas WebP de la película en Canvas y se encuentra
en `scene.html`, `app.js`, `style.css` y `assets/`. Su audio es opcional. No forma
parte del dibujo vectorial. El corte local `source/clip.mp4` está ignorado por Git.

## Comprobaciones

- Personaje: `python3 character/check.py`.
- Escena archivada: `python3 scripts/check_ui.py`.

Los scripts de comprobación usan Playwright, Pillow y `/usr/bin/chromium`.
Para regenerar los SVG: `node character/export.mjs`.
Para exportarlos a PNG: `python3 character/export_png.py` con el servidor en 8000.
