const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/development.json');
const ruta = express.Router();
const Usuario = require('../models/usuario_model'); 

const autentificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.sendStatus(401); // No hay token en el encabezado
        }

        // Verificar el token usando la semilla del archivo de configuración
        const decoded = jwt.verify(token, config.configToken.SEED);

        const usuario = await Usuario.findOne({ _id: decoded.id });
        console.log(usuario);

        if (!usuario) {
            return res.sendStatus(403); // Token no válido o usuario no encontrado
        }

        if (usuario.token !== token) {
            return res.sendStatus(403);
        }
        // Guardar el usuario en el objeto de solicitud para que esté disponible en las rutas
        req.user = usuario;
        next(); 
    } catch (err) {
        console.error('Error verificando token:', err);
        return res.sendStatus(403); 
    }
};


ruta.post('/', autentificarToken, async (req, res) => {
    
    try {
        const usuario = req.user;
        // Eliminar el token del usuario
        usuario.token = "";
        await usuario.save();
        res.sendStatus(204); 
    } catch (err) {
        res.status(500).json({ mensaje: 'Error de conexión', error: err.message });
    }
});

module.exports = ruta;
