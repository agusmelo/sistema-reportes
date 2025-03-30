const path = require("path");
const sqlite3 = require("sqlite3");
const sql3 = sqlite3.verbose();
const { open } = require("sqlite");

let db = null;

(async () => {
  await loadTables();
  // await loadTestData();
})();

async function connectDB() {
  if (!db) {
    try {
      db = await open({
        filename: path.join(__dirname, "database.db"),
        driver: sqlite3.Database,
      });
      console.log("Database connected.");
    } catch (error) {
      console.error("Error connecting to the database:", err.message);
      throw new Error("Database connection failed");
    }
  }
  return db;
}

async function closeDB() {
  if (db) {
    await db.close();
    console.log("Database closed.");
    db = null;
  }
}

async function loadTables() {
  const db = await connectDB();
  const tables = {
    facturas: `CREATE TABLE IF NOT EXISTS facturas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_id INTEGER NOT NULL,
    vehiculo_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    incluye_iva BOOLEAN NOT NULL DEFAULT 1, -- 1 = Include IVA, 0 = No IVA
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
    FOREIGN KEY (vehiculo_id) REFERENCES vehiculos(id) ON DELETE CASCADE
);`,
    items: `
        CREATE TABLE IF NOT EXISTS items_factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factura_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL CHECK (cantidad > 0),
        descripcion TEXT NOT NULL,
        precio_unitario REAL NOT NULL CHECK (precio_unitario >= 0),
        FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
    );`,
    clientes: `
        CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL COLLATE NOCASE UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,
    vehiculos: `CREATE TABLE IF NOT EXISTS vehiculos  (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      marca TEXT NOT NULL,
      modelo TEXT NOT NULL,
      matricula TEXT NOT NULL COLLATE NOCASE UNIQUE,
      kilometraje INTEGER NOT NULL,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
      );`,
  };
  for (const table in tables) {
    db.run(tables[table], [], (err) => {
      if (err) console.log(`Error creating ${table} table`);
      return;
    });
  }
  console.log("Tables created");
}

async function loadTestData() {
  const db = await connectDB();
  const testData = {
    clientes: [
      { nombre: "Cliente 1" },
      { nombre: "Cliente 2" },
      { nombre: "Cliente 3" },
    ],
    vehiculos: [
      {
        cliente_id: 1,
        marca: "Marca A",
        modelo: "Modelo A",
        matricula: "ABC123",
        kilometraje: 10000,
      },
      {
        cliente_id: 2,
        marca: "Marca B",
        modelo: "Modelo B",
        matricula: "DEF456",
        kilometraje: 20000,
      },
      {
        cliente_id: 3,
        marca: "Marca C",
        modelo: "Modelo C",
        matricula: "GHI789",
        kilometraje: 30000,
      },
    ],
    facturas: [
      {
        cliente_id: 1,
        vehiculo_id: 1,
        fecha: new Date(),
        incluye_iva: 1,
      },
      {
        cliente_id: 2,
        vehiculo_id: 2,
        fecha: new Date(),
        incluye_iva: 0,
      },
      {
        cliente_id: 3,
        vehiculo_id: 3,
        fecha: new Date(),
        incluye_iva: 1,
      },
    ],
    items_factura: [
      {
        factura_id: 1,
        cantidad: 1,
        descripcion: "Item 1",
        precio_unitario: 10,
      },
      {
        factura_id: 1,
        cantidad: 2,
        descripcion: "Item 2",
        precio_unitario: 10,
      },
      {
        factura_id: 1,
        cantidad: 3,
        descripcion: "Item 3",
        precio_unitario: 10,
      },

      {
        factura_id: 2,
        cantidad: 1,
        descripcion: "Item 1",
        precio_unitario: 20,
      },
      {
        factura_id: 3,
        cantidad: 1,
        descripcion: "Item 1",
        precio_unitario: 30,
      },
      {
        factura_id: 3,
        cantidad: 2,
        descripcion: "Item 2",
        precio_unitario: 30,
      },
      {
        factura_id: 3,
        cantidad: 3,
        descripcion: "Item 3",
        precio_unitario: 30,
      },
    ],
  };
  db.getDatabaseInstance().serialize(function () {
    db.run("BEGIN");
    for (const table in testData) {
      const data = testData[table];
      for (const row of data) {
        db.run(
          `INSERT INTO ${table} (${Object.keys(row).join(
            ", "
          )}) VALUES (${Object.values(row)
            .map(() => "?")
            .join(", ")})`,
          Object.values(row),
          (err) => {
            if (err) {
              console.log(`Error inserting data into ${table} table`);
              db.run("ROLLBACK", (err) => {
                if (err)
                  console.log(`Error rolling back data in ${table} table`);
              });
              return;
            }
            return;
          }
        );
      }
    }
    db.run("COMMIT", (err) => {
      if (err) console.log(`Error committing data to ${table} table`);
      return;
    });
  });
}

// loadTestData();
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown() {
  console.log("Closing database connection...");
  closeDB();
  process.exit(0);
}
module.exports = { connectDB, closeDB };
