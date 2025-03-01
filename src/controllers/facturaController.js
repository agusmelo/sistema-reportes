const FacturaModel = require("../model/facturas");

// Create a new factura
exports.createFactura = async (req, res) => {
  try {
    // add validation for the request body
    const {
      cliente_id,
      fecha,
      marca,
      modelo,
      matricula,
      kilometraje,
      items,
      tieneIva,
      subtotal,
      total,
    } = req.body;

    FacturaModel.agregarFactura(
      cliente_id,
      fecha,
      marca,
      modelo,
      matricula,
      kilometraje,
      items,
      tieneIva,
      subtotal,
      total
    );
    res.status(201).json(newFactura);
  } catch (error) {
    res.status(400).json({
      message: "Error al crear la factura",
      error: error.message,
    });
  }
};

// Get all facturas
exports.getFacturas = async (req, res) => {
  try {
    const facturas = await FacturaModel.getFacturas();
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
