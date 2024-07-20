const express = require('express');
const Avance = require('../models/avance_model');
const ruta = express.Router();
const autentificarToken = require ('../middleware/autToken');
const autentificarTokenNotAdmin = require('../middleware/autTokenNotAdmin')





router.get('/avances/:idUser', autentificarToken, async (req, res) => {
    const idUsuario = req.params.idUser;
    try {
        let avancesUsuario = await obtenerAvances(idUsuario);
        
        if (!avancesUsuario || avancesUsuario.length === 0) {
            res.json(null);
        } else {
            res.json(avancesUsuario);
        }
    } catch (err) {
        res.status(400).json({ error: 'Error al obtener los avances' });
    }
});


async function obtenerAvances(data){
    try {
        let avances = await Avance.find({ usuario: idUsuario }).sort({ fecha: 1 });
        return avances;
    } catch (error) {
        console.error('Error obteniendo avances:', error);
        throw error;
    }
};

async function registarAvance(data){
    const avance = new Avance(data);
    return await ejercicio.save();
}