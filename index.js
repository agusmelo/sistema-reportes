const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
const path = require('path');

// pdfMake.vfs = pdfFonts.pdfMake.vfs;

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., form HTML, styles)
app.use(express.static('public'));

// Read the HTML template for the PDF
const templatePath = path.join(__dirname, 'templates/invoice.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Añadir después de la declaración de const template
const logoPath = path.join(__dirname, 'public/logo_prov.png');
const logoBase64 = fs.readFileSync(logoPath).toString('base64');

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

        // Crear la definición del documento
        const dd = {
            footer: function(currentPage, pageCount) {
                return {
                    text: 'La Llave | Tel.: +598 99 354 032 | Email: lallavetaller@gmail.com | Dir.: Ildemaro Ribas 1320 | Sarandi Grande, Uruguay',
                    style: 'footer'
                };
            },
            content: [
                { text: 'HOJA DE SERVICIO', style: 'title' },
                {
                    columns: [
                        {
                            image: `data:image/png;base64,${logoBase64}`,
                            width: 150,
                            margin: [0, 0, 20, 20]
                        },
                        {
                            text: [
                                { text: `Cliente: ${client}\n` },
                                { text: `Fecha: ${date}\n` },
                                { text: `Vehículo: ${make} ${model}\n` },
                                { text: `Matrícula: ${plate} Kms: ${mileage}` },
                            ],
                            style: 'info',
                        },
                    ],
                },
                {
                    table: {
                        widths: ['auto', '*', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'Cantidad', style: 'tableHeader' },
                                { text: 'Descripción', style: 'tableHeader' },
                                { text: 'Precio por unidad', style: 'tableHeader' },
                                { text: 'Total de línea', style: 'tableHeader' },
                            ],
                            ...parsedItems.map(item => [
                                item.quantity.toString(),
                                item.description,
                                `$${item.unitPrice.toFixed(2)}`,
                                `$${item.lineTotal.toFixed(2)}`
                            ])
                        ],
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex % 2 === 0 ? '#f7e3dd' : null;
                        },
                        hLineColor: '#b84b2b',
                        vLineColor: '#b84b2b',
                    },
                },
                {
                    table: {
                        widths: ['*', 'auto'],
                        body: [
                            [
                                { text: 'Subtotal', style: 'total' },
                                { text: `$${subtotal.toFixed(2)}`, style: 'total' },
                            ],
                            [
                                { text: 'Total', style: 'total' },
                                { text: `$${total.toFixed(2)}`, style: 'total' },
                            ],
                        ],
                    },
                    layout: 'noBorders',
                },
            ],
            styles: {
                title: { fontSize: 20, bold: true, color: '#113f71', alignment: 'center' },
                info: { fontSize: 16, color: '#113f71', bold: true },
                tableHeader: { fillColor: '#ac292a', color: 'white', bold: true, fontSize: 12 },
                total: { alignment: 'right', bold: true },
                footer: { 
                    fontSize: 10, 
                    color: '#113f71', 
                    margin: [40, 20, 40, 0], 
                    alignment: 'center' 
                },
            },
        };

        // Generar el PDF
        const pdfDoc = pdfMake.createPdf(dd);
        
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
