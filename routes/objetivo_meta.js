const express = require('express');
const ObjetivoMeta = require('../models/objetivo_meta_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();
const autentificarTokenNotAdmin = require('../middleware/autTokenNotAdmin');

const schema = Joi.object({
    nombre: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'El nombre no puede estar vacío.',
        'string.min': 'El nombre debe tener al menos {#limit} caracteres.',
        'string.max': 'El nombre debe tener como máximo {#limit} caracteres.',
        'any.required': 'El nombre es obligatorio.'
    })
});

ruta.get('/',autentificarTokenNotAdmin, async (req, res) => {
    try {
        let objetivos = await listarObjetivos();
        res.json(objetivos)
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/',autentificarTokenNotAdmin,async (req, res) => {
    let body = req.body;

    const { error, value } = schema.validate({
        nombre: body.nombre
    });

    if (error) {
        const detailedErrors = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
        }));
        return res.status(400).json({ error: detailedErrors });
    }

    try {
        const objetivo = await crearObjetivo(value);
        res.json({ valor: objetivo });
    } catch (err) {
        res.status(400).json({ err: err.message });
    }
});

ruta.put('/:id' ,autentificarTokenNotAdmin,async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const { error, value } = updateSchema.validate({
        categoria: body.categoria,
        ejercicios: body.ejercicios,
        disponible: body.disponible
    });

    if (error) {
        const detailedErrors = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
        }));
        return res.status(400).json({ error: detailedErrors });
    }

    try {
        const updateRutina = await editarRutina(id, value);

        if (!updateRutina) {
            return res.status(404).json({ error: 'Rutina no encontrada' });
        }

        res.json(updateRutina);
    } catch (err) {
        res.status(400).json({ err: err.message });
    }
});

async function crearObjetivo(data) {
    const objetivo = new ObjetivoMeta(data);
    return await objetivo.save();
}

async function listarObjetivos(){
    let objetivos = await ObjetivoMeta.find();
    return objetivos;
}

async function editarRutina(id, data) {
    try {
        const updateRutina = await Rutina.findByIdAndUpdate(id, data, { new: true });
        if (!updateRutina) {
            throw new Error('Rutina no encontrada');
        }
        return updateRutina;
    } catch (error) {
        throw new Error('Error actualizando la rutina: ' + error.message);
    }
}

module.exports = ruta;