const path = require('path');
const Sqlite3 = require('sqlite3');
const sql3 = Sqlite3.verbose();

const DB = new sql3.Database(path.join(__dirname,'./database.db'),Sqlite3.OPEN_READWRITE,connected);

function connected(err){
    if(err){
        console.log(err.message)
        return;
    }
    const tables = {
        facturas:`CREATE TABLE facturas (
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
        items:`
        CREATE TABLE IF NOT EXISTS items_factura (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factura_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        precio_unitario REAL NOT NULL,
        total REAL NOT NULL,
        FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE
        );`,
        clientes:`
        CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        telefono TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`

    }

    DB.run(tables.facturas, [], (err) => {
        if(err)
            console.log("Error creating 'facturas' table");
            return;
    })

    DB.run(tables.clientes, [], (err) => {
        if(err)
            console.log("Error creating 'clientes' table");
            return;
    })

    DB.run(tables.items, [], (err) => {
        if(err)
            console.log("Error creating 'items' table");
            return;
    })
    console.log("Table created")
}


module.exports = {DB}
