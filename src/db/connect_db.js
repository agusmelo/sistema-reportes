const path = require("path");
const sqlite3 = require("sqlite3");
const sql3 = sqlite3.verbose();
const { open } = require("sqlite");

let db = null;

loadTables();

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
        fecha DATE NOT NULL,
        marca TEXT NOT NULL,
        modelo TEXT NOT NULL,
        matricula TEXT NOT NULL,
        kilometraje INTEGER NOT NULL,
        iva BOOLEAN NOT NULL,
        subtotal REAL NOT NULL,
        total REAL NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
        );`,
    items: `
        CREATE TABLE IF NOT EXISTS items_factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factura_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        precio_unitario REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
        );`,
    clientes: `
        CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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

module.exports = { connectDB, closeDB };
