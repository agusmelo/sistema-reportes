const Ajv = require("ajv");
const ajv = new Ajv();

const facturaSchema = {
  type: "object",
  properties: {
    client_name: { type: "string" },
    date: { type: "string", format: "date" },
    make: { type: "string" },
    model: { type: "string" },
    plate: { type: "string" },
    mileage: { type: "integer" },
    incluye_iva: { type: "boolean" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          quantity: { type: "integer" },
          description: { type: "string" },
          unitPrice: { type: "number" },
        },
        required: ["quantity", "description", "unitPrice"],
      },
    },
  },
  required: [
    "client_name",
    "date",
    "make",
    "model",
    "plate",
    "mileage",
    "incluye_iva",
    "items",
  ],
};

const validateFactura = ajv.compile(facturaSchema);

module.exports = { validateFactura };
