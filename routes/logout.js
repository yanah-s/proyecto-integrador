const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config/development.json');
const ruta = express.Router();
const Usuario = require('../models/usuario_model');

const autentificarToken = async (req, res, next) => {
    try {
        console.log("Verificando token");
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.sendStatus(401); // No hay token en el encabezado
        }

        const decoded = jwt.verify(token, config.configToken.SEED);

        const usuario = await Usuario.findOne({ _id: decoded.id });
        console.log(usuario);

        if (!usuario) {
            return res.sendStatus(403); // Token no válido o usuario no encontrado
        }

        if (usuario.token !== token) {
            return res.sendStatus(403);
        }

        req.user = usuario;
        next();
    } catch (err) {
        console.error('Error verificando token:', err);
        return res.sendStatus(403);
    }
};

ruta.post('/', autentificarToken, async (req, res) => {
    console.log("Llega al logout");
    try {
        const usuario = req.user;
        // También puedes verificar el usuario recibido en el cuerpo si es necesario
        const usuarioEnviado = req.body.usuario;
        console.log('Usuario recibido:', usuarioEnviado);
        
        // Eliminar el token del usuario
        usuario.token = "";
        usuario.mensajeMotivacion = "";
        await usuario.save();
        console.log("es el user despus del logout" + usuario);
        res.sendStatus(204);
    } catch (err) {
        console.log("Error en el logout");
        res.status(500).json({ mensaje: 'Error de conexión', error: err.message });
    }
});

module.exports = ruta;
