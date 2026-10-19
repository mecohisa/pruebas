"""Build a portable character-only bundle, with no film frames or video."""
from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import json
root=Path(__file__).resolve().parent
output=root/'skeleton-poses.zip'
keep_evidence={'checks.json','studio-desktop.png','studio-mobile.png','asset-0000.png','asset-0120.png','asset-0150.png','asset-0405.png'}
with ZipFile(output,'w',ZIP_DEFLATED) as archive:
    archive.write(root.parent/'index.html','index.html')
    archive.writestr('package.json',json.dumps({'name':'skeleton-vector-character','private':True,'scripts':{'start':'python3 -m http.server 8000 --bind 0.0.0.0'}},indent=2))
    archive.writestr('README.md','# Un esqueleto vectorial reutilizable\n\nEjecuta `npm start` o `python3 -m http.server 8000` desde esta carpeta.\nEl estudio está en `character/index.html`. Los SVG también se pueden abrir directamente.\n\nIncluye un personaje transparente, 660 poses SVG, 660 PNG RGBA, 11 hojas de sprites y el código editable.\nLa animación se reconstruye a partir de 44 poses clave; no es un calco exacto del vídeo.\nConsulta `character/README.md` para instrucciones y ejemplos de integración.\nEl vídeo y la escena completa quedan fuera de este paquete.\n')
    for path in sorted(root.rglob('*')):
        if not path.is_file():continue
        relative=path.relative_to(root)
        if relative.parts[0] in {'reference','__pycache__'} or path.suffix=='.zip':continue
        if relative.parts[0]=='evidence' and path.name not in keep_evidence:continue
        if relative.as_posix()=='index.html':
            html=path.read_text().replace('href="../scene.html"','href="README.md"').replace('Ver escena de referencia →','Guía de uso →')
            html=html.replace('<a href="skeleton-poses.zip" download>Todas las poses SVG + PNG <span>→</span></a>','<a href="README.md">Guía de los recursos incluidos <span>→</span></a>')
            archive.writestr('character/index.html',html)
        else:archive.write(path,'character/'+relative.as_posix())
with ZipFile(output) as archive:
    assert archive.testzip() is None
    for folder in ['poses','png']:
        assert len([name for name in archive.namelist() if name.startswith('character/'+folder+'/')])==660
print(f'{output}: {output.stat().st_size/1024/1024:.1f} MiB. ZIP íntegro; 660 SVG y 660 PNG.')
