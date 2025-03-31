const FacturaModel = require("../model/facturas");
const ClientModel = require("../model/clientes");
const VehicleModel = require("../model/vehiculos");
const responseHandler = require("../utils/responseHandler");
const { appendToJsonFile } = require("../utils/jsonAppender");
const path = require("path");
const fs = require("fs");
const { generateFacturaPDF } = require("../utils/genFacturaPDF");
const { MESES } = require("../utils/constants");

// Create a new factura
exports.createFactura = async (req, res) => {
  try {
    // add validation for the request body
    const { cliente_id, vehiculo_id, fecha, items, tieneIva, subtotal, total } =
      req.body;

    const idFactura = await FacturaModel.agregarFactura(
      cliente_id,
      vehiculo_id,
      fecha,
      items,
      tieneIva,
      subtotal,
      total
    );
    responseHandler.success(res, idFactura, "Factura creada con éxito", 201);
  } catch (error) {
    console.error(
      `Error creating invoice: ${error.message} - ${JSON.stringify(req.body)}`
    );
    responseHandler.error(res, error.message, 400);
  }
};

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

exports.generateFactura = async (req, res) => {
  try {
    //TODO : add validation for the request body
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
    // facturaValidation(client_id, date, make, model, plate, mileage, iva, items);

    let client, vehicle;
    try {
      client = await ClientModel.obtenerClientePorNombre(client_name);
      vehicle = await VehicleModel.obtenerVehiculoPorMatricula(plate);
    } catch (err) {
      return responseHandler.error(
        res,
        `Error al obtener el cliente o el vehículo: ${err.message}`,
        500
      );
    }

    if (!isEmergencia || isEmergencia !== "true") {
      // Si no es emergencia, guardar en la base de datos

      // const subtotal = items.reduce((acc, item) => {
      //   return acc + item.precio * item.cantidad;
      // }, 0);
      // const total = iva ? subtotal * 1.21 : subtotal;
      if (!client) {
        return responseHandler.error(
          res,
          `El cliente ${client_name} no existe`,
          404
        );
      }
      if (!vehicle) {
        return responseHandler.error(
          res,
          `El vehículo ${plate} no existe`,
          404
        );
      }
      if (client.id !== vehicle.cliente_id) {
        return responseHandler.error(
          res,
          `El vehículo ${plate} no pertenece al cliente ${client_name}`,
          400
        );
      }
      try {
        //TODO: esto deberia actualizarse en otro lado
        await VehicleModel.actualizarKilometraje(plate, mileage);
      } catch (e) {
        console.error("Error updating kilometraje:", e);
        return responseHandler.error(
          res,
          `Error al actualizar el kilometraje del vehículo: ${e.message}`,
          500
        );
      }
      try {
        const idFactura = await FacturaModel.agregarFactura(
          client.id,
          vehicle.id,
          date,
          items,
          incluye_iva
        );
        console.log(`Factura ${idFactura} creada correctamente`);
        // Si la factura se crea correctamente, se puede continuar
      } catch (e) {
        console.error("Error creando la factura:", e);
        return responseHandler.error(
          res,
          `Error al crear la factura: ${e.message}`,
          500
        );
      }
    } else {
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
    }
    const fechaFactura = new Date(date);
    const nombreDeArchivo = `${client_name}_${fechaFactura.getDate()}_${
      MESES[fechaFactura.getMonth()]
    }_${fechaFactura.getFullYear()}_${make}_${model}`;

    // Crear la definición del document
    const pdfBuffer = await generateFacturaPDF({
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
    });
    // Guardar JSON
    const jsonOutputPath = path.join(__dirname, "output/invoice.json");
    appendToJsonFile(jsonOutputPath, {
      client,
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
    });
    fs.writeFileSync(
      jsonOutputPath,
      JSON.stringify(
        {
          client,
          date,
          make,
          model,
          plate,
          mileage,
          items,
          total,
          subtotal,
        },
        null,
        2
      ),
      "utf-8"
    );

    // Guardar el PDF en el servidor
    pdfBuffer.getBuffer((buffer) => {
      const privateOutputPath = path.join(
        __dirname,
        "output",
        `${nombreDeArchivo}.pdf`
      );
      const publicOutputPath = path.join(
        __dirname,
        "../public",
        "ultima_factura_generada",
        `${nombreDeArchivo}.pdf`
      );

      fs.writeFileSync(privateOutputPath, buffer);
      // Crear un enlace simbólico del PDF en la carpeta public
      if (fs.existsSync(publicOutputPath)) {
        fs.unlinkSync(publicOutputPath);
      }
      fs.symlinkSync(privateOutputPath, publicOutputPath);
      // fs.writeFileSync(`./public/${nombreDeArvhivo}.pdf`, buffer);

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "X-Redirect-Url",
        `/ultima_factura_generada/${nombreDeArchivo}.pdf`
      );
      res.json({
        message: "Factura generada exitosamente",
        pdfUrl: `/ultima_factura_generada/${nombreDeArchivo}.pdf`,
        jsonPath: jsonOutputPath,
      });
    });
  } catch (err) {
    console.error("Error generating invoice:", err);
    res.status(500).send({ error: "Failed to generate invoice" });
  }
};
