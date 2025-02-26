const path = require('path');
const db = require(path.join(__dirname,'../db/connect_db'))

// Manejador para crear un nuevo usuario
exports.createUser = (req, res) => {
    // Lógica para crear un usuario
    const {name, telefono} = req.body;

    try {
        agregarCliente(name, telefono)
    } catch (error) {
        
    }
    res.status(201).send("Usuario creado");
};

// Manejador para obtener todos los usuarios
exports.getAllUsers = (req, res) => {
    // Lógica para obtener todos los usuarios
    // console.log(req)
    
    res.status(200).send("Lista de usuarios");
};

// Manejador para obtener un usuario por ID
exports.getUserById = (req, res) => {
    const clientId = req.params.id;
    try {
        const dataCliente = obtenerCliente(clientId);
        res
        .status(200)
        .json({
            message: "Cliente " + clientId,
            data: dataCliente
        });
    } catch (error) {
        res
            .status(500)
            .json({
                message:"Error obteniendo cliente",
            })
    }
};

// Manejador para actualizar un usuario
exports.updateUser = (req, res) => {
    const userId = req.params.id;
    // Lógica para actualizar un usuario
    res.status(200).send(`Usuario con ID: ${userId} actualizado`);
};

// Manejador para eliminar un usuario
exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    // Lógica para eliminar un usuario
    res.status(204).send();
};
