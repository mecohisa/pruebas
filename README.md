# The Skeleton Dance — reconstrucción del baile

Reproducción en HTML, CSS y JavaScript de los cuatro esqueletos del corte aportado
por el usuario, correspondiente a 02:38–03:00 del vídeo de referencia.

La animación utiliza **660 imágenes WebP extraídas del corte y dibujadas en Canvas**,
a 30000/1001 fps (29,97). No utiliza una etiqueta `<video>` ni dibujos vectoriales
aproximados. Es una reconstrucción basada en fotogramas del original, no una
reimplementación de sus personajes mediante geometría o un rig de huesos.
Los fotogramas preservan las figuras, el escenario, la textura y la coreografía;
la secuencia no interpola ni inventa poses.

## Abrir

```sh
cd /workspace/pruebas
npm start
```

Alternativa sin Node: `python3 -m http.server 8000 --bind 0.0.0.0`.
No hay paquetes de frontend que instalar y no se necesita Internet.
El servidor tiene que arrancarse de nuevo en cada máquina; el proceso no forma
parte del snapshot.

Controles: pausa/reproducción, reinicio, línea de tiempo, avance y retroceso de un
fotograma, velocidad 0,25×–1,5× y banda sonora opcional. La galería detiene la
animación en cada pose. Espacio reproduce/pausa; ←/→ avanzan por fotogramas cuando
el foco no está sobre un control. La preferencia de movimiento reducido inicia
en pausa. Al ocultar la pestaña se pausa la reproducción. El sonido se activa
solo con el botón; su reloj sincroniza la imagen cuando está activado.

## Fidelidad y resolución

- Fuente: `Skeleton Dance - clip 2m38s-3m00s.mp4`, 1920×1080, 660 fotogramas.
- Se eliminan únicamente las bandas negras laterales: recorte 1296×1080 en x=312.
- Reproducción: 864×720, WebP calidad 92, para reducir transferencia y memoria.
- Galería: ocho PNG de 1296×1080, sin reducción de resolución ni compresión con pérdidas.
- Cadencia y duración de imagen: 30000/1001 fps, 22,022 segundos.
- Audio: pista AAC del corte copiada sin recodificación.
- El salto del final al inicio es un bucle del corte; no se ha modificado la
  coreografía para esconder esa transición.

La secuencia completa ocupa unos 61 MiB. El reproductor carga una ventana de
fotogramas y libera las imágenes decodificadas que quedan lejos del punto actual;
no decodifica el clip completo en memoria. Se recomienda servir desde HTTP.

## Archivos

- `index.html`, `style.css`, `app.js`: interfaz y reproductor Canvas.
- `assets/dance/0000.webp` a `0659.webp`: secuencia completa.
- `assets/poses/`: ocho fotogramas PNG de referencia.
- `assets/poses-originales.zip`: conjunto PNG descargable.
- `assets/manifest.json`: datos de procedencia, recorte, frecuencia y marcas temporales.
- `assets/soundtrack.m4a`: audio original del corte.
- `evidence/desktop.png`, `mobile.png`: capturas de comprobación visual.
- `evidence/canvas-0120.png`, `canvas-0400.png`: salida directa de Canvas.
- `evidence/checks.json`: resultados de pruebas y comparación con las imágenes fuente.
- `source/clip.mp4`: copia local del corte, ignorada por Git y excluida del ZIP del proyecto.

## Regenerar los recursos

Requiere FFmpeg y Python. El archivo fuente debe ser el corte aportado a 1920×1080.

```sh
cd /workspace/pruebas
python3 scripts/prepare_clip.py source/clip.mp4
```

El script regenera las imágenes, los PNG, el audio y los metadatos a partir del
corte local. No necesita YouTube ni yt-dlp. El script anterior `scripts/video.py`
se conserva como utilidad de descarga, pero no es un requisito de este flujo.

## Verificación

Con el servidor arrancado, ejecutar `python3 scripts/check_ui.py`.
Requiere Playwright, Chromium en `/usr/bin/chromium` y Pillow, disponibles en
esta máquina. Comprueba reproducción, pausa, selección de las ocho poses,
avance/retroceso de un fotograma, salto al último fotograma, bucle, velocidad,
sincronización del audio, adaptación móvil y movimiento reducido. Decodifica
las 660 imágenes para detectar archivos incompletos. Compara la salida del
Canvas con los ocho PNG extraídos de la fuente (PSNR > 35 dB) y guarda capturas.
