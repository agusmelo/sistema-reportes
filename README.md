## Como configurar las fonts ([doc](https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/vfs/)):

1. Crear el directorio examples/fonts en la carpeta modules del pdfmake (./node_modules/pdfmake/)
Osea que quede asi: ./node_modules/pdfmake/examples/fonts
2.Meter todas las fonts que quiera en /fonts
3.Parado en ./node_modules/pdfmake/ runear el comando node build-vfs.js "./examples/fonts" (esto genera el archivo build/vfs_fonts.js)
4. Ahora las fonts que estan adentro de example/fonts estan accesibles para importar en el archivo generado (build/vfs_fonts.js). Hay que importarlo en nuestro codigo
```js 
const vfs_fonts = require('pdfmake/build/vfs_fonts')
```  
5. Crear las el objecto de fonts a usar:
```js
yourFontName: {
    normal: 'fontFile.ttf',
    bold: 'fontFile2.ttf',
    italics: 'fontFile3.ttf',
    bolditalics: 'fontFile4.ttf'
  },
  anotherFontName: {
    (...)
  },
```
(no hay que poner toda la ruta hasta la font, solo el nombre de los archivos de las fonts. Eso es porque son accedidas desde el virtual file system)
6. Agregarlas al createPdf en el 3er parametro\
```js
const pdfDoc = pdfMake.createPdf(docDefinition, null, fonts)
```

Listo :D, despues de hacer eso se pueden usar las fonts normalmente.




