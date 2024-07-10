const express = require('express');
const Usuario = require('../models/usuario_model');
const jwt = require('jsonwebtoken');
const ruta = express.Router();
const config = require('../config/development.json');



ruta.post('/', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email);
        // Buscar usuario por email
        let usuario = await Usuario.findOne({ email });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario o contraseña incorrecta' });
        }

        // Función asincrónica para comparar el código de recuperación
        async function compararCodigo(codigoIngresado) {
         
            if(codigoIngresado === usuario.codigoRecuperacion){
                return true;
            }else if(await usuario.compararPassword(password) ){
               usuario.codigoRecuperacion = "";
               usuario.save();
                return true;
            }
            return false;
        }

        let esPasswordCorrecta = false;

        // Comparar el código de recuperación si el usuario tiene
        if (usuario.codigoRecuperacion !== "") {
            const esCodigoCorrecto = await compararCodigo(password);
            console.log(esCodigoCorrecto);
            if (!esCodigoCorrecto) {
                return res.status(401).json({ mensaje: 'Usuario o contraseña incorrecta' });
            }
        } else {
            // Comparar la contraseña ingresada
            esPasswordCorrecta = await usuario.compararPassword(password);
            if (!esPasswordCorrecta) {
                return res.status(401).json({ mensaje: 'Usuario o contraseña incorrecta' });
            }
        }

        // Si la contraseña es correcta, resetear el código de recuperación
        if (esPasswordCorrecta) {
            usuario.codigoRecuperacion = "";
            await usuario.save();
        }

        // Generar un token JWT
        const token = jwt.sign(
            { id: usuario._id, email: usuario.email },
            config.configToken.SEED,
            { expiresIn: config.configToken.expiration }
        );
        usuario.token = token;
        // if(usuario.administrador){
        //     const administrador = 0;
        // }
        console.log('token generado');
        console.log(usuario.token);
        await usuario.save();
        
        return res.json({
            mensaje: 'Autenticación exitosa',
            token,
            usuario: {
                id: usuario._id,
                email: usuario.email,
                admin: usuario.administrador
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ mensaje: 'Error de conexión', error: err.message });
    }
});

module.exports = ruta;
