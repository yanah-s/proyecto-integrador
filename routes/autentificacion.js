const express = require('express');
const Usuario = require('../models/usuario_model');
const jwt = require('jsonwebtoken');
const ruta = express.Router();

ruta.post('/', async (req, res) => {
    try {
        let usuario = await buscarUsuario(req.body.email);
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Comparar la contraseña ingresada con la cifrada
        const esPasswordCorrecta = await usuario.compararPassword(req.body.password);
        if (!esPasswordCorrecta) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email , password: usuario.password},
            'proyecto',
            { expiresIn: '10h' }
        );

        return res.json({ mensaje: 'Autenticación exitosa', token , usuario: {
            id: usuario.id,
            email: usuario.email,
            password: usuario.password
        }});
    } catch (err) {
        return res.status(500).json({ mensaje: 'Error al buscar el usuario', error: err.message });
    }
});

async function buscarUsuario(emailIngresado) {
    return Usuario.findOne({ email: emailIngresado });
}

module.exports = ruta;
