const HORIZONTAL_SPACE = '    '


const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// Corregir las importaciones de pdfMake y sus fuentes
const pdfMake = require('pdfmake/build/pdfmake');
const vfs_fonts = require('pdfmake/build/vfs_fonts');
pdfMake.addVirtualFileSystem(vfs_fonts);
// // Configurar las fuentes correctamente
const fonts = {
    Courier: {
      normal: 'CourierPrime-Regular.ttf',
      bold: 'CourierPrime-Bold.ttf',
      italics: 'CourierPrime-Italic.ttf',
      bolditalics: 'CourierPrime-BoldItalic.ttf'
    },
    Arial: {
      normal: 'arial.ttf',
      bold: 'arialbd.ttf',
      italics: 'arial.ttf',
      bolditalics: 'arialbd.ttf'
    }
  };


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., form HTML, styles)
app.use(express.static('public'));

// Read the HTML template for the PDF
const templatePath = path.join(__dirname, 'templates/invoice.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Modificar la forma en que se maneja el logo
const logoPath = path.join(__dirname, 'public/logo_prov.png');
const logoBase64 = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

// Route to process the form submission
app.post('/generate-invoice', async (req, res) => {
    try {
        const { client, date, make, model, plate, mileage, items, iva } = req.body;
        
        // Calculate line totals and overall total
        const parsedItems = items.map(item => ({
            quantity: parseFloat(item.quantity),
            description: item.description,
            unitPrice: parseFloat(item.unitPrice),
            lineTotal: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        }));

        const subtotal = parsedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const total = iva === 'on' ? subtotal + subtotal*0.22 : subtotal;
        const ivaSolo = iva === 'on' ? subtotal*0.22 : 0

        // Crear la definición del documento
        const docDefinition = {
            content: [
                {
                    style: 'invoiceInfo',
                    columns: [
                        {
                            width: '*',
                            stack: [
                                { text: 'Fecha:', bold: true },
                                { text: 'Número de factura:', bold: true },
                                { text: 'Vencimiento:', bold: true }
                            ]
                        },
                        {
                            width: 'auto',
                            stack: [
                                { text: new Date().toLocaleDateString() },
                                { text: '001-002-000000123' },
                                { text: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString() }
                            ]
                        }
                    ]
                },
                { text: 'HOJA DE SERVICIO', style: 'title', alignment: 'center' },
                {
                    columns: [
                        {
                            width: 'auto',
                            image: logoBase64,
                            fit: [200, 200],
                            margin: [0, 0, 0, 0]
                        },
                        {
                            width: '*',
                            text: [
                                { text: `Cliente: `, style: 'label',lineHeight: 2, },
                                { text: `${client}\n`, style: 'value',lineHeight: 2, },
                                { text: `Fecha: `, style: 'label',lineHeight: 2, },
                                { text: `${date}\n`, style: 'value',lineHeight: 2, },
                                { text: `Vehículo: `, style: 'label',lineHeight: 2, },
                                { text: `${make}${HORIZONTAL_SPACE}`, style: 'value',lineHeight: 2, },
                                { text: `Modelo: `, style: 'label',lineHeight: 2, },
                                { text: `${model}\n`, style: 'value',lineHeight: 2, },
                                { text: `Matrícula: `, style: 'label',lineHeight: 2, },
                                { text: `${plate}${HORIZONTAL_SPACE}`, style: 'value',lineHeight: 2, },
                                { text: `Kms: `, style: 'label',lineHeight: 2, },
                                { text: `${mileage}`, style: 'value',lineHeight: 2, },
                            ],
                            margin: [20, 20, 0, 0]
                        }
                    ]
                },
                { text: '', margin: [0, 10, 0, 10] },
                {
                    table: {
                        headerRows: 1,
                        dontBreakRows: true, //Para que no splitee la row en dos al final de la pagina
                        widths: [30, '*', 80, 80],
                        heights: function(row){
                            if(row == 0)
                                return 30
                        },
                        body: [
                            [
                                { text: 'Cant.', style: 'tableHeader' },
                                { text: 'Descripción', style: 'tableHeader' },
                                { text: 'Precio', style: 'tableHeader' },
                                { text: 'Total', style: 'tableHeader' },
                            ],
                            ...parsedItems.map(item => [
                                { text: item.quantity.toString(), alignment: 'center' },
                                { text: item.description },
                                { text: `$${item.unitPrice.toFixed(2)}`, alignment: 'right' },
                                { text: `$${item.lineTotal.toFixed(2)}`, alignment: 'right' }
                            ])
                        ],
                    },
                    layout: {
                        hLineWidth: function(i, node) { return 1; },
                        vLineWidth: function(i, node) { return 1; },
                        hLineColor: function(i, node) { return '#b84b2b'; },
                        vLineColor: function(i, node) { return '#b84b2b'; },
                        fillColor: function(rowIndex, node, columnIndex) {
                            return rowIndex % 2 === 0 ? '#f7e3dd' : null;
                        },
                    }
                },
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 'auto',
                            table: {
                                dontBreakRows: true,
                                widths: [80, 80],
                                body: [
                                    [
                                        { text: 'Subtotal:', style: 'totalLabel' },
                                        { text: `$${subtotal.toFixed(2)}`, style: 'totalAmount' }
                                    ],
                                    [
                                        { text: 'Total:', style: 'totalLabel' },
                                        { text: `$${total.toFixed(2)}`, style: 'totalAmount' }
                                    ]
                                ]
                            },
                            // layout: 'noBorders',
                            layout: {
                                hLineWidth: function(i, node) { return 1; },
                                vLineWidth: function(i, node) { return 1; },
                                hLineColor: function(i, node) { return '#b84b2b'; },
                                vLineColor: function(i, node) { return '#b84b2b'; },
                                fillColor: function(rowIndex, node, columnIndex) {
                                    return rowIndex % 2 === 0 ? '#f7e3dd' : null;
                                },
                            },
                            margin: [0, 0, 0, 0]
                        }
                    ]
                }
            ],
            styles: {
                title: { 
                    fontSize: 24,
                    font:'Courier',
                    bold: true,
                    color: '#113f71',
                    alignment: 'right',
                    margin: [0, 0, 0, 10]
                },
                label: {
                    fontSize: 12,
                    font:'Courier',
                    color: '#113f71',
                    bold: true
                },
                value: {
                    fontSize: 12,
                    font:'Courier',
                    color: '#000000'
                },
                tableHeader: {
                    fillColor: '#ac292a',
                    color: 'white',
                    bold: true,
                    fontSize: 12,
                    alignment: 'left'
                },
                totalLabel: {
                    alignment: 'right',
                    bold: true,
                    fontSize: 12,
                    color: '#113f71',
                    border: 0
                },
                totalAmount: {
                    alignment: 'right',
                    bold: true,
                    fontSize: 12
                },
                footerCapacidades: {
                    fontSize: 8,
                    color: '#113f71',
                    alignment: 'center',
                    margin: [0, 0, 0, 5]
                },
                footerContacto: {
                    fontSize: 10,
                    color: '#113f71',
                    alignment: 'center',
                    margin: [0, 5, 0, 0]
                },
                invoiceTitle: {
                    fontSize: 28,
                    bold: true,
                    alignment: 'right',
                    margin: [0, 0, 0, 20]
                },
                invoiceInfo: {
                    margin: [0, 20, 0, 20]
                }
            },
            defaultStyle: {
                font:'Arial',
                fontSize: 11
            }
        };

        // Generar el PDF
        const pdfDoc = pdfMake.createPdf(docDefinition, null, fonts);
        
        // Guardar el PDF en el servidor
        pdfDoc.getBuffer((buffer) => {
            fs.writeFileSync('./output/invoice.pdf', buffer);
            
            // Guardar JSON
            const jsonOutputPath = './output/invoice.json';
            fs.writeFileSync(jsonOutputPath, JSON.stringify({ client, date, make, model, plate, mileage, items: parsedItems, total, subtotal }, null, 2), 'utf-8');

            res.send({
                message: "Invoice generated successfully!",
                pdfPath: "/output/invoice.pdf",
                jsonPath: "/output/invoice.json",
            });
        });
    } catch (err) {
        console.error("Error generating invoice:", err);
        res.status(500).send({ error: "Failed to generate invoice" });
    }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
