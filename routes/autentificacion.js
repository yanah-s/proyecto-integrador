const express = require('express');
const Usuario = require('../models/usuario_model');
const jwt = require('jsonwebtoken');
const ruta = express.Router();
const config = require('../config/development.json');
const Motivacional = require ('../models/motivacionales_model');
const rutina_ej_alumno = require ('../models/rutina_ej_alumno_model.js');

async function generarMotivacion(usuarioId, ultimaConexion) {
    try {
        let usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            console.log('Usuario no encontrado');
            return;
        }
        if (usuario.administrador) {
            console.log('Usuario es administrador');
            return;
        }
        if (!usuario.alumno) {
            console.log('No es alumno');
            return;
        }
       

        const hoy = new Date();
        const diasDiferencia = Math.floor((hoy - ultimaConexion) / (1000 * 60 * 60 * 24));
        let rutinasUsuario = await rutina_ej_alumno.find({ usuario: usuario._id, completado: true })
                                                   .sort({ fecha: 1 });

        let mensaje = '';
        if (diasDiferencia >= 7) {
            console.log("entra al dias de diferencia login")
            mensaje = await sortearMensajeMotivacion(usuarioId, "desmotivado");
        } else if (rutinasUsuario.length > 0 && 
                   Math.floor((hoy - rutinasUsuario[rutinasUsuario.length - 1].fecha) / (1000 * 60 * 60 * 24)) >= 7) {
                    console.log("entra al dias de rutina")
                    console.log(rutinasUsuario[rutinasUsuario.length - 1].fecha);
           console.log((hoy - rutinasUsuario[rutinasUsuario.length - 1].fecha) / (1000 * 60 * 60 * 24));
                    mensaje = await sortearMensajeMotivacion(usuarioId, "motivado");
        } else {
            usuario.mensajeMotivacion = "";
            await usuario.save();
            console.log("termina funcion");
        }

        if (mensaje) {

            console.log('Mensaje motivacional para el usuario:', mensaje);
            return mensaje;
        }

    } catch (error) {
        console.error('Error al generar motivación:', error);
    }
}

async function sortearMensajeMotivacion(usuarioId, estado) {
    try {
        let mensajes = [];
        if (estado === "motivado") {
            mensajes = await Motivacional.find({ categoria: "motivado" });
        } else if (estado === "desmotivado") {
            mensajes = await Motivacional.find({ categoria: "desmotivado" });
        }

        if (mensajes.length === 0) {
            console.log("No hay mensajes motivacionales disponibles.");
            return 'No hay mensajes motivacionales disponibles.';
        }

        const indiceAleatorio = Math.floor(Math.random() * mensajes.length);
        let usuario = await Usuario.findById(usuarioId);
        if (!usuario) {
            console.log('Usuario no encontrado');
            return;
        }
        usuario.mensajeMotivacion = mensajes[indiceAleatorio].mensaje;
        await usuario.save();
        console.log("ahora termina");

        // Devolver el mensaje guardado
        return usuario.mensajeMotivacion;

    } catch (error) {
        console.error('Error al obtener mensajes motivacionales:', error);
        return 'Error al obtener un mensaje motivacional.';
    }
}


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
        const fechaUltimaConexion = usuario.ultimaConexion;
        const hoy = new Date();
        usuario.ultimaConexion = hoy;
        console.log('token generado');
        console.log(usuario.token);
        await usuario.save();
        
        console.log(fechaUltimaConexion);
        // await generarMotivacion(usuario._id, fechaUltimaConexion);
        console.log("despues de generar");
        return res.json({
            mensaje: 'Autenticación exitosa',
            token,
            usuario: {
                id: usuario._id,
                email: usuario.email,
                admin: usuario.administrador,
                alumno: usuario.alumno,
                mensaje : await generarMotivacion(usuario._id, fechaUltimaConexion),
            }
           
        });
        
    } catch (err) {
        console.log(err);
        return res.status(500).json({ mensaje: 'Error de conexión', error: err.message });
    }
});

module.exports = ruta;
