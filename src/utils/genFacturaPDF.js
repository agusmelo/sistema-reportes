//? Si hay un error con las fonts, seguro es que no se configuraron (ejecutar install_pdfmake_fonts o leer el README)
const CUSTOM_FIELDS = {};
import fs from "fs";

import path from "path";
import { fileURLToPath } from "url";
import { HORIZONTAL_SPACE } from "./constants.js";
import pdfMake from "pdfmake/build/pdfmake.js";
import vfs_fonts from "pdfmake/build/vfs_fonts.js";
pdfMake.addVirtualFileSystem(vfs_fonts);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fonts = {
  Courier: {
    normal: "CourierPrime-Regular.ttf",
    bold: "CourierPrime-Bold.ttf",
    italics: "CourierPrime-Italic.ttf",
    bolditalics: "CourierPrime-BoldItalic.ttf",
  },
  Arial: {
    normal: "arial.ttf",
    bold: "arialbd.ttf",
    italics: "arial.ttf",
    bolditalics: "arialbd.ttf",
  },
};

export const generateFacturaPDF = async (data) => {
  const {
    client_name,
    date,
    make,
    model,
    plate,
    mileage,
    items,
    incluye_iva,
    ivaSolo,
    subtotal,
    total,
  } = data;

  // Calculate line totals and overall total
  const parsedItems = items.map((item) => ({
    quantity: parseFloat(item.quantity),
    description: item.description,
    unitPrice: parseFloat(item.unitPrice),
    lineTotal: parseFloat(item.quantity) * parseFloat(item.unitPrice),
  }));
  // const subtotal = parsedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  // const total = iva === "on" ? subtotal + subtotal * 0.22 : subtotal;
  // const ivaSolo = incluye_iva === "on" ? subtotal * 0.22 : 0;

  CUSTOM_FIELDS.ivaField = incluye_iva
    ? [
        { text: "IVA:", style: "totalLabel" },
        { text: `$${ivaSolo.toFixed(2)}`, style: "totalAmount" },
      ]
    : [
        { text: "", style: "totalLabel" },
        { text: "", style: "totalAmount" },
      ];

  const logoPath = path.join(__dirname, "../../public/assets/logo_prov.png");
  const logoBase64 = `data:image/png;base64,${fs
    .readFileSync(logoPath)
    .toString("base64")}`;
  const docDefinition = {
    pageMargins: [40, 40, 40, 80], // [left, top, right, bottom]
    footer: function (currentPage, pageCount) {
      return {
        stack: [
          {
            text: "DIAGNÓSTICO Y PREPARACIÓN MECÁNICA • INYECCIÓN ELECTRÓNICA - SCANNER • INYECCIÓN DIESEL ELECTRÓNICA AUTOMOTRIZ • PROGRAMACIÓN Y CODIFICACIÓN DEL AUTOMÓVIL • REPARACIÓN DE MÓDULOS",
            style: "footerCapacidades",
          },
          {
            canvas: [
              {
                type: "line",
                x1: 0,
                y1: 5,
                x2: 515,
                y2: 5,
                lineWidth: 1,
                lineColor: "#113f71",
              },
            ],
          },
          {
            text: "La Llave | Tel.: +598 99 354 032 | Email: lallavetaller@gmail.com | Dir.: Ildemaro Ribas 1320 | Sarandi Grande, Uruguay",
            style: "footerContacto",
          },
        ],
        margin: [40, 10, 40, 10],
      };
    },
    content: [
      // {
      //     style: 'invoiceInfo',
      //     columns: [
      //         {
      //             width: '*',
      //             stack: [
      //                 { text: 'Fecha:', bold: true },
      //                 { text: 'Número de factura:', bold: true },
      //                 { text: 'Vencimiento:', bold: true }
      //             ]
      //         },
      //         {
      //             width: 'auto',
      //             stack: [
      //                 { text: new Date().toLocaleDateString() },
      //                 { text: '001-002-000000123' },
      //                 { text: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString() }
      //             ]
      //         }
      //     ]
      // },
      { text: "HOJA DE SERVICIO", style: "title", alignment: "center" },
      {
        columns: [
          {
            width: "auto",
            image: logoBase64,
            fit: [200, 200],
            margin: [0, 0, 0, 0],
          },
          {
            width: "*",
            text: [
              { text: `Cliente: `, style: "label", lineHeight: 2 },
              { text: `${client_name}\n`, style: "value", lineHeight: 2 },
              { text: `Fecha: `, style: "label", lineHeight: 2 },
              { text: `${date}\n`, style: "value", lineHeight: 2 },
              { text: `Vehículo: `, style: "label", lineHeight: 2 },
              {
                text: `${make}${HORIZONTAL_SPACE}`,
                style: "value",
                lineHeight: 2,
              },
              { text: `Modelo: `, style: "label", lineHeight: 2 },
              { text: `${model}\n`, style: "value", lineHeight: 2 },
              { text: `Matrícula: `, style: "label", lineHeight: 2 },
              {
                text: `${plate}${HORIZONTAL_SPACE}`,
                style: "value",
                lineHeight: 2,
              },
              { text: `Kms: `, style: "label", lineHeight: 2 },
              { text: `${mileage}`, style: "value", lineHeight: 2 },
            ],
            margin: [20, 20, 0, 0],
          },
        ],
      },
      { text: "", margin: [0, 10, 0, 10] },
      {
        table: {
          headerRows: 1,
          dontBreakRows: true, //Para que no splitee la row en dos al final de la pagina
          widths: [30, "*", 80, 80],
          heights: function (row) {
            if (row == 0) return 30;
          },
          body: [
            [
              { text: "Cant.", style: "tableHeader" },
              { text: "Descripción", style: "tableHeader" },
              { text: "Precio", style: "tableHeader" },
              { text: "Total", style: "tableHeader" },
            ],
            ...parsedItems.map((item) => [
              { text: item.quantity.toString(), alignment: "center" },
              { text: item.description },
              { text: `$${item.unitPrice.toFixed(2)}`, alignment: "right" },
              { text: `$${item.lineTotal.toFixed(2)}`, alignment: "right" },
            ]),
          ],
        },
        layout: {
          hLineWidth: function (i, node) {
            return 1;
          },
          vLineWidth: function (i, node) {
            return 1;
          },
          hLineColor: function (i, node) {
            return "#b84b2b";
          },
          vLineColor: function (i, node) {
            return "#b84b2b";
          },
          fillColor: function (rowIndex, node, columnIndex) {
            return rowIndex % 2 === 0 ? "#f7e3dd" : null;
          },
        },
      },
      {
        columns: [
          { width: "*", text: "" },
          {
            width: "auto",
            table: {
              dontBreakRows: true,
              widths: [80, 80],
              heights: [12, 12],
              body: [
                [
                  { text: "Subtotal:", style: "totalLabel" },
                  { text: `$${subtotal.toFixed(2)}`, style: "totalAmount" },
                ],
                CUSTOM_FIELDS.ivaField,
                [
                  { text: "Total:", style: "totalLabel" },
                  { text: `$${total.toFixed(2)}`, style: "totalAmount" },
                ],
              ],
            },
            // layout: 'noBorders',
            layout: {
              hLineWidth: function (i, node) {
                return 1;
              },
              vLineWidth: function (i, node) {
                return 1;
              },
              hLineColor: function (i, node) {
                return "#b84b2b";
              },
              vLineColor: function (i, node) {
                return "#b84b2b";
              },
              fillColor: function (rowIndex, node, columnIndex) {
                return rowIndex % 2 === 0 ? "#f7e3dd" : null;
              },
            },
            margin: [0, 0, 0, 0],
          },
        ],
      },
    ],
    styles: {
      title: {
        fontSize: 24,
        font: "Courier",
        bold: true,
        color: "#113f71",
        alignment: "right",
        margin: [0, 0, 0, 10],
      },
      label: {
        fontSize: 12,
        font: "Courier",
        color: "#113f71",
        bold: true,
      },
      value: {
        fontSize: 12,
        font: "Courier",
        color: "#000000",
      },
      tableHeader: {
        fillColor: "#ac292a",
        color: "white",
        bold: true,
        fontSize: 12,
        alignment: "left",
      },
      totalLabel: {
        alignment: "right",
        bold: true,
        fontSize: 12,
        color: "#ac292a",
        border: 0,
      },
      totalAmount: {
        alignment: "right",
        bold: true,
        fontSize: 12,
      },
      footerCapacidades: {
        fontSize: 8,
        color: "#113f71",
        alignment: "center",
        margin: [0, 0, 0, 5],
      },
      footerContacto: {
        fontSize: 10,
        color: "#113f71",
        alignment: "center",
        margin: [0, 5, 0, 0],
      },
      invoiceTitle: {
        fontSize: 28,
        bold: true,
        alignment: "right",
        margin: [0, 0, 0, 20],
      },
      invoiceInfo: {
        margin: [0, 20, 0, 20],
      },
    },
    defaultStyle: {
      font: "Arial",
      fontSize: 11,
    },
  };

  // Generar el PDF
  const pdfDoc = pdfMake.createPdf(docDefinition, null, fonts);

  return new Promise((resolve, reject) => {
    pdfDoc.getBuffer((buffer) => {
      resolve(buffer);
    });
  });
};
