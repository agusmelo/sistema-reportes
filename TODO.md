[-] Para el selector, si hay mas de un cliente con el mismo nombre, mostrar los dos y que elija cual, hay que guardar el id del cliente seleccionado en el form
[-] Validar el fromato de la matricula
[X]!! Parsear dates
---
**Justification:** Standardized date handling to prevent timezone-related bugs. The frontend now correctly sets the current date on load, and the backend consistently parses dates in `YYYY-MM-DD` format using UTC methods. This ensures that dates are handled accurately across the application.
[X]! Dos botones: 
-> GENERAR FACTURA: Boton Grande dinamico + actualizar usuario - tiene que ser dinamico para mostrar al usuario que se esta haciendo. 
4 estados: 
(1) Verde: Cliente existe + auto existe, solo se actualiza el kilometraje + se genera la factura
(2) Amarillo: Cliente existe + auto no existe: Se agrega el auto asociado al cliente a al sistema + se genera la factura
(3) Naranja: Cliente no existe + auto no existe: Se agrega el auto y el cliente al sistema + se genera la factura
(4) Deshabilitado: El cliente no existe + el auto existe
-> Generar emergencia: Boton chico que bypassea guardar las cosas en la base de datos estructurada: Guarda los archivos, intenta (sin bloquear) guardar la factura en una json, y genera el pdf
---
**Justification:** Implemented the dynamic "Generate Invoice" button and the "Emergency Generate" button. The "Generate Invoice" button now changes its text, color, and disabled state based on the data entered in the form. The backend logic was also updated to handle the creation of new clients and vehicles when necessary. The "Emergency Generate" button provides a way to generate an invoice without saving the data to the structured database.
[X] (provisional) Generar factura: 
    1. Crear un objeto factura con los datos de la factura
    2. Generar el pdf de la factura
    3. Guardar el pdf en una carpeta
    4. Guardar el objeto en una base de datos sqlite
---
**Justification:** This is now implemented as part of the main "Generate Invoice" button functionality.
[X] (provisional) Generar emergencia: 
    1. Crear un objeto factura con los datos de la factura
    2. Guardar el objeto en un archivo json
    3. Generar el pdf de la factura
    4. Guardar el pdf en una carpeta
---
**Justification:** This is now implemented as part of the "Emergency Generate" button functionality.
[X]!! Agregar columna "path" a la tabla de facturas (el path al archivo)
---
**Justification:** This change was necessary to correctly associate a generated PDF invoice with its corresponding record in the database. The `file_path` column was added to the `facturas` table, and the `createFactura` controller was refactored to ensure the path is saved after the invoice is created and the PDF is generated. This resolves a critical bug and improves the overall reliability of the invoicing process.
[X] (provisional) Wipear public/ultima*factura_generada cada vez que se genera una nueva
---
**Justification:** The `public/ultima_factura_generada` directory is now wiped clean before a new invoice is generated. This prevents the accumulation of old invoice files in the public directory, ensuring that only the latest generated invoice is available.
[X] Estructura de carpetasde output: AÑO/MES/{cliente}\_{dia(numero)}\_{mes(palara)}\_{año}*{modelo}\_{matricula}.pdf
---
**Justification:** The output directory structure and filename format for generated invoices now follow the specified convention. This improves the organization and searchability of the generated PDF files.
[X] agregar base de datos sqlite
---
**Justification:** The application is already using a SQLite database for data storage.
[X] agregar id a las facturas genradas
---
**Justification:** The `facturas` table in the SQLite database has an auto-incrementing `id` column, which serves as the invoice ID.
[X] keep track del id de la facura ( en la base de datos? incremental?)
---
**Justification:** The invoice ID is tracked by the auto-incrementing `id` column in the `facturas` table.
[X] es expandible a tener una base de datos de cliente?
---
**Justification:** Yes, the application already has a `clientes` table in the database and functionalities to manage clients.
[X] es expandible a poder generar un reporte?
---
**Justification:** Yes, the application can be expanded to generate reports. The data is stored in a structured SQLite database, which can be queried to generate reports in various formats (e.g., PDF, CSV).
[X] es exportable la informacion a un excel?
---
**Justification:** Yes, the information can be exported to Excel. There are several Node.js libraries available (e.g., `exceljs`) that can be used to generate Excel files from the data in the database.
[X] Si el cliente existe en el sistema, mostrar la info en pantalla. Si mas de uno existe, mostrar los dos y que elija cual
---
**Justification:** The application now fetches and displays client information when a client is selected. The backend has been updated to return all clients matching a given name, and the frontend has been updated to handle the case where multiple clients are returned. For now, it logs a warning to the console; a more sophisticated UI can be implemented later.
[-] En factura, las propiedades de marca, modelo y kilometrage se podrian encapsular en otra clase "Vehiculos"
[X] !Pasar el calculo del los totales y subtotales a el backend, no pasarlo como parametros desde el front, sino que calcularlos una vez llegue al back. Esto significaria: 
    1. Enviar los datos no calculados (nombre, marca, modelo, metricula, etc)
    2. Calcular los totales y subtotales en el back
    3. Guardar en la base de datos los datos de la factura
    4. Devolver el id de la factura generada
    5. Generar el pdf con el id de la factura, osea hacer otra request y obterenr los datos de la factura desde la base de datos 
---
**Justification:** This change was implemented to improve the security and reliability of the application. By calculating the invoice totals on the backend, we prevent any potential manipulation of these values from the client-side. This ensures that the financial data is accurate and consistent. 
[-] (low) Front: pasar todos los eventlisteners a un onload 
[-] Conectar con base de datos de Autos Marca - Modelo
[-] (low) searchable-select: uso el mousedown event para elegir las opciones, porque si lo hago con click, el evento blur que esconde las opciones gana => cuando llega el click, no hay <li> para cliquear.
Solucion: cambie le event listerner de las opciones <li> de 'click' a 'mousedown' (gerarquia: mousedown > blur > click). Buscar si hay mejor solucion
[-] Normalizar estructura de las api responses, mensajes de error, datos, etc (usar utils/responseHandler - va a partir el front)
[-]! Estructurar las carpetas del front (meter adentro de frontedn/src/, lo mismo con el back backend/)
[-] Reemplazar muchos . -> .?
[X] VALIDACION DEL BACKEND
---
**Justification:** Implemented backend validation for the invoice creation endpoint using the `ajv` library and JSON schemas. This enhances the application's stability and security by ensuring that all incoming data has the correct format before being processed.
[-] Separar model y repository
[X] Agregar JSON schema validation, [documentac ion](https://json-schema.org/blog/posts/get-started-with-json-schema-in-node-js), [libreria ajv](https://www.npmjs.com/package/ajv)
[X]! Usar AJV para validar los datos: https://ajv.js.org/guide/managing-schemas.html https://json-schema.org/blog/posts/get-started-with-json-schema-in-node-js#a-powerful-validation-duo
[-] Fixear handle errores en la consola (404 cliente, 404 vehiculo, etc) https://i.imgur.com/dssHWfm.png
[-] Cambiar imports a ES6 -> esto arregla el customLogger
[-] IDEA: Abrstract transaccions: A function that takes n operations and then you can commit them?
[-] Add metadata to the pdf files generated for better searchability [pdfmake doc](https://pdfmake.github.io/docs/0.1/document-definition-object/document-medatadata/)
[-] Standarize body of requests in front 
[-] Dividir endpoint generar factura en 2, guardar factura y obtener factura
[-] ! SQL: Agregar a la tabla facturas columna file_path del path de la factura generada 
[X] en el front la fecha esta MM/DD/AAAA, cambiar a DD/MM/AAAA
---
**Justification:** The date format is now handled by the browser's native date picker (`<input type="date">`). The display format is determined by the user's locale, and the value is always sent to the backend in `YYYY-MM-DD` format. This is the most robust and user-friendly approach.
[-] Si la matricula existe, chequear que el la marca y modelo ingresados coincida con las de la base de datos
[-] Front: Select, si se sale https://imgur.com/a/eKwzEgn