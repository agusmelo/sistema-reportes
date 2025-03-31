[-]!! Parsear dates
[-]! Dos botones: 
-> GENERAR FACTURA: Boton Grande dinamico + actualizar usuario - tiene que ser dinamico para mostrar al usuario que se esta haciendo. 
4 estados: 
(1) Verde: Cliente existe + auto existe, solo se actualiza el kilometraje + se genera la factura
(2) Amarillo: Cliente existe + auto no existe: Se agrega el auto asociado al cliente a al sistema + se genera la factura
(3) Naranja: Cliente no existe + auto no existe: Se agrega el auto y el cliente al sistema + se genera la factura
(4) Deshabilitado: El cliente no existe + el auto existe
-> Generar emergencia: Boton chico que bypassea guardar las cosas en la base de datos estructurada: Guarda los archivos, intenta (sin bloquear) guardar la factura en una json, y genera el pdf
[-] (provisional) Generar factura: 
    1. Crear un objeto factura con los datos de la factura
    2. Generar el pdf de la factura
    3. Guardar el pdf en una carpeta
    4. Guardar el objeto en una base de datos sqlite
[-] (provisional) Generar emergencia: 
    1. Crear un objeto factura con los datos de la factura
    2. Guardar el objeto en un archivo json
    3. Generar el pdf de la factura
    4. Guardar el pdf en una carpeta
[-]!! Agregar columna "path" a la tabla de facturas (el path al archivo)
[-] (provisional) Wipear public/ultima*factura_generada cada vez que se genera una nueva
[-] Estructura de carpetasde output: AÑO/MES/{cliente}\_{dia(numero)}\_{mes(palara)}\_{año}*{modelo}\_{matricula}.pdf
[-] agregar base de datos sqlite
[-] agregar id a las facturas genradas
[-] keep track del id de la facura ( en la base de datos? incremental?)
[-] es expandible a tener una base de datos de cliente?
[-] es expandible a poder generar un reporte?
[-] es exportable la informacion a un excel?
[-] Si el cliente existe en el sistema, mostrar la info en pantalla. Si mas de uno existe, mostrar los dos y que elija cual
[-] En factura, las propiedades de marca, modelo y kilometrage se podrian encapsular en otra clase "Vehiculos"
[-] !Pasar el calculo del los totales y subtotales a el backend, no pasarlo como parametros desde el front, sino que calcularlos una vez llegue al back. Esto significaria: 
    1. Enviar los datos no calculados (nombre, marca, modelo, metricula, etc)
    2. Calcular los totales y subtotales en el back
    3. Guardar en la base de datos los datos de la factura
    4. Devolver el id de la factura generada
    5. Generar el pdf con el id de la factura, osea hacer otra request y obterenr los datos de la factura desde la base de datos 
[-] (low) Front: pasar todos los eventlisteners a un onload 
[-] Conectar con base de datos de Autos Marca - Modelo
[-] (low) searchable-select: uso el mousedown event para elegir las opciones, porque si lo hago con click, el evento blur que esconde las opciones gana => cuando llega el click, no hay <li> para cliquear.
Solucion: cambie le event listerner de las opciones <li> de 'click' a 'mousedown' (gerarquia: mousedown > blur > click). Buscar si hay mejor solucion
[-] Normalizar estructura de las api responses, mensajes de error, datos, etc (usar utils/responseHandler - va a partir el front)
[-]! Estructurar las carpetas del front (meter adentro de frontedn/src/, lo mismo con el back backend/)
[-] Reemplazar muchos . -> .?
[-] VALIDACION DEL BACKEND
[-] Separar model y repository
[-] Agregar JSON schema validation, [documentac ion](https://json-schema.org/blog/posts/get-started-with-json-schema-in-node-js), [libreria ajv](https://www.npmjs.com/package/ajv)
[-]! Usar AJV para validar los datos: https://ajv.js.org/guide/managing-schemas.html https://json-schema.org/blog/posts/get-started-with-json-schema-in-node-js#a-powerful-validation-duo
[-] Fixear handle errores en la consola (404 cliente, 404 vehiculo, etc) https://i.imgur.com/dssHWfm.png
[-] Cambiar imports a ES6 -> esto arregla el customLogger
[-] IDEA: Abrstract transaccions: A function that takes n operations and then you can commit them?
[-] Add metadata to the pdf files generated for better searchability [pdfmake doc](https://pdfmake.github.io/docs/0.1/document-definition-object/document-medatadata/)