const path = require('path');
const db = require(path.join(__dirname,'../db/connect_db.js'))


async function agregarCliente(cliente) {
  try {
    const resultado = await db.query('INSERT INTO clientes SET ?', [cliente]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerClientes() {
  try {
    const resultado = await db.query('SELECT * FROM clientes');
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function obtenerCliente(id) {
  try {
    const resultado = await db.query('SELECT * FROM clientes WHERE id = ?', [id]);
    return resultado[0];
  } catch (error) {
    throw error;
  }
}

async function actualizarCliente(id, cambios) {
  try {
    const resultado = await db.query('UPDATE clientes SET ? WHERE id = ?', [cambios, id]);
    return resultado;
  } catch (error) {
    throw error;
  }
}

async function eliminarCliente(id) {
  try {
    const resultado = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
    return resultado;
  } catch (error) {
    throw error;
  }
}


module.exports = {agregarCliente, obtenerCliente, obtenerClientes, actualizarCliente, eliminarCliente}