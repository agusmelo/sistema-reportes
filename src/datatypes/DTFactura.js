class DTFactura {
  constructor(
    id,
    cliente_id,
    fecha,
    marca,
    modelo,
    kilometrage,
    items, // Array de DTItemFactura
    iva,
    subtotal,
    total
  ) {
    this.id = id;
    this.cliente_id = cliente_id;
    this.fecha = fecha;
    this.marca = marca;
    this.modelo = modelo;
    this.kilometrage = kilometrage;
    this.items = items;
    this.iva = iva;
    this.subtotal = subtotal;
    this.total = total;
  }
}

class DTItemFactura {
  constructor(id, factura_id, cantidad, descripcion, precio_unitario, total) {
    this.id = id;
    this.factura_id = factura_id;
    this.cantidad = cantidad;
    this.descripcion = descripcion;
    this.precio_unitario = precio_unitario;
    this.total = total;
  }
}

modules.exports = {
  DTFactura,
  DTItemFactura,
};
