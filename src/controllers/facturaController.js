const FacturaModel = require("../model/facturas");
const ClientModel = require("../model/clientes");
const VehicleModel = require("../model/vehiculos");
const responseHandler = require("../utils/responseHandler");
const { appendToJsonFile } = require("../utils/jsonAppender");
const path = require("path");
const fs = require("fs");
const { generateFacturaPDF } = require("../utils/genFacturaPDF");
const { MESES } = require("../utils/constants");
const { ensurePathAndFile } = require("../utils/helpers");
const { validateFactura } = require("../utils/validation");

exports.createFactura = async (req, res) => {
  try {
    const valid = validateFactura(req.body);
    if (!valid) {
      return responseHandler.error(
        res,
        "Invalid request body",
        400,
        validateFactura.errors
      );
    }
    const {
      client_name,
      date,
      make,
      model,
      plate,
      mileage,
      incluye_iva,
      items,
    } = req.body;
    const { emergencia: isEmergencia } = req.query;

    // Accion log
    const actionLog = {
      pdfCreated: false,
      jsonCreated: false,
      pdfStored: false,
      dbStored: false,
      kilometrajeUpdated: false,
    };

    // Get client and vehicle
    let client, vehicle;
    try {
      client = await ClientModel.obtenerClientePorNombre(client_name);
      if (!client) {
        const newClient = await ClientModel.agregarCliente(client_name);
        client = await ClientModel.obtenerCliente(newClient.lastID);
      }

      vehicle = await VehicleModel.obtenerVehiculoPorMatricula(plate);
      if (!vehicle) {
        const newVehicle = await VehicleModel.agregarVehiculo(
          client.id,
          make,
          model,
          plate,
          mileage
        );
        vehicle = await VehicleModel.obtenerVehiculo(newVehicle.lastID);
      }
    } catch (err) {
      return responseHandler.error(
        res,
        `Error al obtener o crear el cliente o el vehículo: ${err.message}`,
        500
      );
    }

    // Handle emergency case
    if (isEmergencia && isEmergencia === "true") {
      //TODO: Implementar el caso de emergencia
      // Si es emergencia, no guardar en la base de datos
      console.log("Emergencia: no se guardará en la base de datos");
      appendToJsonFile(path.join(__dirname, "../output", "emergencia.json"), {
        client_name,
        date,
        make,
        model,
        plate,
        mileage,
        incluye_iva,
        items,
      });
      return responseHandler.success(
        res,
        {},
        "Factura de emergencia generada (parcialmente).",
        200
      );
    }

    // --- Normal flow ---

    // Validations
    if (!client) {
      return responseHandler.error(
        res,
        `El cliente ${client_name} no existe`,
        404
      );
    }
    if (!vehicle) {
      return responseHandler.error(res, `El vehículo ${plate} no existe`, 404);
    }
    if (client.id !== vehicle.cliente_id) {
      return responseHandler.error(
        res,
        `El vehículo ${plate} no pertenece al cliente ${client_name}`,
        400
      );
    }

    // Update mileage
    try {
      await VehicleModel.actualizarKilometraje(plate, mileage);
      actionLog.kilometrajeUpdated = true;
    } catch (e) {
      console.error("Error updating kilometraje:", e);
      return responseHandler.error(
        res,
        `Error al actualizar el kilometraje del vehículo: ${e.message}`,
        500
      );
    }

    let idFactura;
    try {
      // 1. Create invoice to get the ID
      idFactura = await FacturaModel.agregarFactura(
        client.id,
        vehicle.id,
        date,
        items,
        incluye_iva
      );
      actionLog.dbStored = true;
      console.log(`Factura ${idFactura} creada correctamente en la BD.`);
    } catch (e) {
      console.error("Error creando la factura:", e);
      return responseHandler.error(
        res,
        `Error al crear la factura: ${e.message}`,
        500
      );
    }

    // 2. Generate file path and name
    const fechaFactura = new Date(date);
    const year = fechaFactura.getUTCFullYear();
    const month = fechaFactura.getUTCMonth();
    const day = fechaFactura.getUTCDate();

    const nombreDeArchivo = `${client_name}_${day}_${MESES[month]}_${year}*${model}_${plate}.pdf`;

    const privateOutputPath = path.join(
      __dirname,
      "../output",
      year.toString(),
      MESES[month],
      nombreDeArchivo
    );

    // 3. Update invoice with file_path
    try {
      await FacturaModel.actualizarFactura(idFactura, {
        file_path: privateOutputPath,
      });
      console.log(`Factura ${idFactura} actualizada con file_path.`);
    } catch (e) {
      console.error("Error updating factura with file_path:", e);
      return responseHandler.error(
        res,
        `Error al actualizar la factura con el path: ${e.message}`,
        500
      );
    }

    // 4. Get full invoice data for PDF generation
    const facturaCompleta = await FacturaModel.getInvoiceWithTotal(idFactura);
    if (!facturaCompleta) {
      return responseHandler.error(
        res,
        "No se pudo obtener la factura completa para generar el PDF.",
        500
      );
    }

    // Calculate totals
    const subtotal = items.reduce(
      (acc, item) => acc + item.quantity * item.unitPrice,
      0
    );
    const iva = incluye_iva ? subtotal * 0.21 : 0;
    const total = subtotal + iva;

    // 5. Generate PDF
    const pdfBuffer = await generateFacturaPDF({
      client_name,
      date,
      make,
      model,
      plate,
      mileage,
      items,
      incluye_iva,
      ivaSolo: iva,
      subtotal: subtotal,
      total: total,
    });
    actionLog.pdfCreated = true;

    // 6. Store PDF (private and public link)
    const publicOutputPath = path.join(
      __dirname,
      "../../public",
      "ultima_factura_generada",
      nombreDeArchivo
    );
    storePDF(pdfBuffer, publicOutputPath, privateOutputPath);
    actionLog.pdfStored = true;

    // 7. Save JSON representation
    const jsonOutputPath = path.join(__dirname, "../output/invoice.json");
    appendToJsonFile(jsonOutputPath, {
      id: idFactura,
      client,
      date,
      make,
      model,
      plate,
      mileage,
      items,
      incluye_iva,
      ivaSolo: iva,
      subtotal: subtotal,
      total: total,
      file_path: privateOutputPath,
    });
    actionLog.jsonCreated = true;

    // 8. Send success response
    return responseHandler.success(
      res,
      {
        pdfUrl: `/ultima_factura_generada/${nombreDeArchivo}`,
        jsonPath: jsonOutputPath,
        invoiceId: idFactura,
      },
      "Factura generada exitosamente",
      201 // Use 201 for resource creation
    );
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).send({ error: "Failed to generate invoice" });
  }
};
("");

// Get all facturas
exports.getFacturas = async (req, res) => {
  try {
    const facturas = await FacturaModel.obtenerFacturas();
    res.status(200).json(facturas);
  } catch (error) {
    res.status(500).json({
      message: "Error al botener las facturas",
      error: error.message,
    });
  }
};

// Get a single factura by ID
exports.getFacturaById = async (req, res) => {
  try {
    const { id } = req.params;
    const factura = await FacturaModel.obtenerFactura(id);
    if (!factura) {
      return res.status(404).json({ message: "Factura not found" });
    }
    res.status(200).json(factura);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a factura by ID
exports.updateFactura = async (req, res) => {
  try {
    const updatedFactura = await FacturaModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedFactura) {
      return res.status(404).json({ message: "Factura not found" });
    }
    res.status(200).json(updatedFactura);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a factura by ID
exports.deleteFactura = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedFactura = await FacturaModel.eliminarFactura(id);
    if (!deletedFactura) {
      return res.status(404).json({ message: "Factura not found" });
    }
    res.status(200).json({ message: "Factura deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// -> GENERAR FACTURA: Boton Grande dinamico + actualizar usuario - tiene que ser dinamico para mostrar al usuario que se esta haciendo.
// 4 estados:
// (1) Verde: Cliente existe + auto existe, solo se actualiza el kilometraje + se genera la factura
// (2) Amarillo: Cliente existe + auto no existe: Se agrega el auto asociado al cliente a al sistema + se genera la factura
// (3) Naranja: Cliente no existe + auto no existe: Se agrega el auto y el cliente al sistema + se genera la factura
// (4) Deshabilitado: El cliente no existe + el auto existe
// -> Generar emergencia: Boton chico que bypassea guardar las cosas en la base de datos estructurada: Guarda los archivos, intenta (sin bloquear) guardar la factura en una json, y genera el pdf
//Validation will be implemented with ajv
//PRE: cliente existe + auto existe
//POST: cliente existe + auto existe + se actualiza el kilometraje + se genera la factura + (if !emergencia) -> se guarda en la base de datos estructurada

//Example entry
// {
//   "client_name": "Cliente 1",
//   "date": "2023-10-01",
//   "make": "Marca A",
//   "model": "Modelo A",
//   "plate": "ABC123",
//   "mileage": 10000,
//   "iva": true,
//   "items": [
//     {
//       "description": "Item 1",
//       "quantity": 2,
//       "unit_price": 10
//     },
//     {
//       "description": "Item 2",
//       "quantity": 1,
//       "unit_price": 20
//     }
//   ]
// }

function storePDF(pdfBuffer, publicFilePath, privateFilePath) {
  const publicDir = path.dirname(publicFilePath);

  // Wipe the public directory
  if (fs.existsSync(publicDir)) {
    fs.readdirSync(publicDir).forEach((file) => {
      const curPath = path.join(publicDir, file);
      fs.unlinkSync(curPath);
    });
  }

  // Atomic write to prevent corrpution in case of crash
  ensurePathAndFile(
    path.dirname(privateFilePath),
    path.basename(privateFilePath),
    pdfBuffer
  );
  // writeFileAtomicSync(privateFilePath, pdfBuffer);
  if (fs.existsSync(publicFilePath)) {
    fs.unlinkSync(publicFilePath);
  }
  fs.symlinkSync(privateFilePath, publicFilePath);
}
