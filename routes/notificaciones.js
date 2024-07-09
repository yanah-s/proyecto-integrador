const express = require('express');
const Ejercicio = require('../models/ejercicio_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();
const autentificarToken = require ('../middleware/autToken');
const Usuario = require('../models/usuario_model');
const jwt = require('jsonwebtoken');
const config = require('../config/development.json');

ruta.get('/', autentificarToken, async (req, res) => {
    try {
        console.log(req.usuario._id);
        const user = await Usuario.findById(req.usuario._id);
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        console.log("aca si");
        const notificacionesNoLeidas = user.notificacionesUsuario.filter(notificacionesUsuario => !notificacionesUsuario.read);
       
        console.log("notificaciones no leidas" + notificacionesNoLeidas);
        
        res.json(notificacionesNoLeidas);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error obteniendo notificaciones', error });
    }
});


// ruta.post('/markAsRead', autentificarToken, async (req, res) => {
   
//     try {
//         const user = await Usuario.findById(req.usuario._id);
//         if (!user) {
//             return res.status(404).json({ message: 'Usuario no encontrado' });
//         }

//         // Filtrar las notificaciones no leídas antes de la actualización
//         const notificacionesNoLeidas = user.notificacionesUsuario.filter(notificacion => !notificacion.read);
  
//         if (notificacionesNoLeidas.length === 0) {
//             const ultimasNotificaciones = user.notificacionesUsuario
//                 .slice(-5)  // Obtener las últimas 5 notificaciones
//                 .reverse(); // Invertir el orden para devolverlas en orden cronológico descendente
            
//             return res.json({ notificaciones: ultimasNotificaciones });
//         }
//         console.log(notificacionesNoLeidas);
//         // Actualizar todas las notificaciones no leídas a leídas
//         await Usuario.updateOne(
//             { _id: user._id, 'notificacionesUsuario.read': false },
//             { $set: { 'notificacionesUsuario.$[].read': true } }
//         );

//         console.log("marcadas como leidas");
//         res.json({ message: 'Notificaciones marcadas como leídas' });
//     } catch (error) {
//         res.status(500).json({ message: 'Error marcando notificaciones como leídas', error });
//     }
// });
ruta.post('/markAsRead', autentificarToken, async (req, res) => {
    try {
        const user = await Usuario.findById(req.usuario._id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // Filtrar las notificaciones no leídas antes de la actualización
        const notificacionesNoLeidas = user.notificacionesUsuario.filter(notificacion => !notificacion.read);

        // Obtener las últimas 5 notificaciones en cualquier caso
        const ultimasNotificaciones = user.notificacionesUsuario
            .slice(-5)  // Obtener las últimas 5 notificaciones
            .reverse(); // Invertir el orden para devolverlas en orden cronológico descendente
            
        // Marcar todas las notificaciones no leídas como leídas
        await Usuario.updateMany(
            { _id: user._id, 'notificacionesUsuario.read': false },
            { $set: { 'notificacionesUsuario.$[].read': true } }
        );

        console.log("marcadas como leídas");
        res.json({ notificaciones: ultimasNotificaciones });
    } catch (error) {
        res.status(500).json({ message: 'Error marcando notificaciones como leídas', error });
    }
});


ruta.post('/nuevaNotificacion', autentificarToken, async (req, res) => {
    try {
        console.log("llega");
        const user = req.usuario; 
        const { message } = req.body; // Mensaje de notificación que viene del cuerpo de la solicitud

        console.log("usuario" + user + "mensaje" + message);
        // Crea una nueva notificación
        const newNotification = {
            message,
            read: false,
            timestamp: Date.now()
        };

        // Añade la nueva notificación al usuario
        await Usuario.updateOne(
            { _id: user._id }, 
            { $push: { notificacionesUsuario: newNotification } }
        );
        console.log(Usuario);
        res.json({ message: 'Nueva notificación agregada' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Error agregando nueva notificación', error });
    }
});

module.exports = ruta;