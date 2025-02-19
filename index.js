const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const pdf = require('pdf-creator-node');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files (e.g., form HTML, styles)
app.use(express.static('public'));

// Read the HTML template for the PDF
const templatePath = path.join(__dirname, 'templates/invoice.html');
const template = fs.readFileSync(templatePath, 'utf-8');

// Route to process the form submission
app.post('/generate-invoice', async (req, res) => {
    try {
        const { client, date, make, model, plate, mileage, items, iva } = req.body;
        console.log(req.body)
        // Calculate line totals and overall total
        const parsedItems = items.map(item => ({
            quantity: parseFloat(item.quantity),
            description: item.description,
            unitPrice: parseFloat(item.unitPrice),
            lineTotal: parseFloat(item.quantity) * parseFloat(item.unitPrice),
        }));

        const subtotal = parsedItems.reduce((sum, item) => sum + item.lineTotal, 0);
        const total = iva === 'on' ? subtotal + subtotal*0.22 : subtotal;

        // Invoice data
        const data = {
            client,
            date,
            make,
            model,
            plate,
            mileage: parseInt(mileage),
            items: parsedItems,
            total: total.toFixed(2),
            subtotal: subtotal.toFixed(2)
        };

        // PDF options
        const options = {
            format: "A4",
            orientation: "portrait",
            border: "10mm",
            footer: {
                contents:{
                    default: `
                            <footer>
                                <p class="info_capacidades">DIAGNÓSTICO Y PREPARACIÓN MECÁNICA • INYECCIÓN ELECTRÓNICA - SCANNER • INYECCIÓN DIESEL ELECTRÓNICA AUTOMOTRIZ • PROGRAMACIÓN Y CODIFICACIÓN DEL AUTOMÓVIL • REPARACIÓN DE MÓDULOS</p>
                                <hr>
                                <p class="info_contacto">La Llave | Tel.: +598 99 354 032 | Email: lallavetaller@gmail.com | Dir.: Ildemaro Ribas 1320 | Sarandi Grande. Uruguay</p>
                            </footer>
                            `
                }
            }
        };

        // PDF document configuration
        const document = {
            html: template,
            data: data,
            path: "./output/invoice.pdf",
        };

        // Generate PDF
        await pdf.create(document, options);

        // Save JSON
        const jsonOutputPath = './output/invoice.json';
        fs.writeFileSync(jsonOutputPath, JSON.stringify(data, null, 2), 'utf-8');

        // Send response to client
        res.send({
            message: "Invoice generated successfully!",
            pdfPath: "/output/invoice.pdf",
            jsonPath: "/output/invoice.json",
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
