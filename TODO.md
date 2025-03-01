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