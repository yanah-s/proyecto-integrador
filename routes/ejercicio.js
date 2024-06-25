const express = require('express');
const Ejercicio = require('../models/ejercicio_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();

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
    }),

    categoria: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'La categoría no puede estar vacía.',
        'string.min': 'La categoría debe tener al menos {#limit} caracteres.',
        'string.max': 'La categoría debe tener como máximo {#limit} caracteres.',
        'any.required': 'La categoría es obligatoria.'
    }),

    musculoPpal: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'El músculo ppal no puede estar vacío.',
        'string.min': 'El músculo ppal debe tener al menos {#limit} caracteres.',
        'string.max': 'El músculo ppal debe tener como máximo {#limit} caracteres.',
        'any.required': 'El músculo ppal es obligatorio.'
    }),

    otrosMusculos: Joi.array()
    .items(Joi.string()),

    descripcion: Joi.string()
    .min(3)
    .max(150)
    .allow('')
    .messages({
        'string.min': 'La descripción debe tener al menos {#limit} caracteres.',
        'string.max': 'La descripción debe tener como máximo {#limit} caracteres.',
    }),

    video: Joi.string()
    .uri()
    .allow(''),

    disponible: Joi.boolean()
    .default(true)
});

const updateSchema = Joi.object({
    categoria: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'La categoría no puede estar vacía.',
        'string.min': 'La categoría debe tener al menos {#limit} caracteres.',
        'string.max': 'La categoría debe tener como máximo {#limit} caracteres.',
        'any.required': 'La categoría es obligatoria.'
    }),
    
    musculoPpal: Joi.string()
    .min(3)
    .max(50)
    .required()
    .messages({
        'string.empty': 'El músculo ppal no puede estar vacío.',
        'string.min': 'EL músculo ppal debe tener al menos {#limit} caracteres.',
        'string.max': 'EL músculo ppal debe tener como máximo {#limit} caracteres.',
        'any.required': 'EL músculo ppal es obligatorio.'
    }),
    
    otrosMusculos: Joi.array()
    .items(Joi.string()),
    
    descripcion: Joi.string()
    .min(3)
    .max(150)
    .allow('')
    .messages({
        'string.min': 'La descripción debe tener al menos {#limit} caracteres.',
        'string.max': 'La descripción debe tener como máximo {#limit} caracteres.',
    }),
    
    video: Joi.string()
    .uri()
    .allow(''),
    
    disponible: Joi.boolean()
    .default(true)
});


ruta.get('/', async (req, res) => {
    try {
        let ejercicios = await listarEjercicios();
        res.json(ejercicios)
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/', async (req, res) => {
    let body = req.body;

    const { error, value } = schema.validate({
        nombre: body.nombre,
        categoria: body.categoria,
        musculoPpal: body.musculoPpal,
        otrosMusculos: body.otrosMusculos,
        descripcion: body.descripcion,
        video: body.video,
        disponible: body.disponible
    });

   if (!error) {
        try {
            const ejercicio = await crearEjercicio(value);
            res.json({ valor: ejercicio });
        } catch (err) {
            res.status(400).json({ err: err.message });
        }
    } else {
        const detailedErrors = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
        }));
        console.log(detailedErrors);
        res.status(400).json({ error: detailedErrors });
    }
});

ruta.put('/:id', async (req, res) => {
    const { id } = req.params;
    const body = req.body;
    const { error, value } = updateSchema.validate({
        categoria: body.categoria,
        musculoPpal: body.musculoPpal,
        otrosMusculos: body.otrosMusculos,
        descripcion: body.descripcion,
        video: body.video,
        disponible: body.disponible
    });

    if (error) {
        const detailedErrors = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
        }));
        console.log(detailedErrors);
        res.status(400).json({ error: detailedErrors });
    }

    try {
        const updatedEjercicio = await editarEjercicio(id, value);

        if (!updatedEjercicio) {
            return res.status(404).json({ error: 'Ejercicio no encontrado' });
        }

        res.json(updatedEjercicio);
    } catch (err) {
        res.status(400).json({ err: err.message });
    }
});

ruta.put('/:id/deshabilitar', async (req, res) => {
    const { id } = req.params;
    try {
      const ejercicioActualizado = await deshabilitarEjercicio(id);
      res.json(ejercicioActualizado);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

async function crearEjercicio(data) {
    const ejercicio = new Ejercicio(data);
    return await ejercicio.save();
}

async function deshabilitarEjercicio(id) {
    try {
      const ejercicio = await Ejercicio.findByIdAndUpdate(id, { disponible: false });
      if (!ejercicio) {
        throw new Error('Ejercicio no encontrado');
      }
      return ejercicio;
    } catch (error) {
      throw new Error('Error al deshabilitar ejercicio: ' + error.message);
    }
}

async function listarEjercicios(){
    let ejercicios = await Ejercicio.find();
    return ejercicios;
}

async function listarEjerciciosDisponibles(){
    let ejercicios = await Ejercicio.find(({disponible: true}));
    return ejercicios;
}

async function editarEjercicio(id, data) {
    try {
        const updatedEjercicio = await Ejercicio.findByIdAndUpdate(id, data, { new: true });
        return updatedEjercicio;
    } catch (error) {
        throw new Error('Error actualizando el ejercicio');
    }
}

module.exports = ruta;