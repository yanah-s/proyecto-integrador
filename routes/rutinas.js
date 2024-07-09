const express = require('express');
const Rutina = require('../models/rutina_model');
const Ejercicio = require('../models/ejercicio_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();
const autentificarToken = require ('../middleware/autToken');

const ejercicioSchema = Joi.object({
    _id: Joi.string().length(24).required().messages({
        'string.empty': 'El ID del ejercicio no puede estar vacío.',
        'any.required': 'El ID del ejercicio es obligatorio.'
    }),
    nombre: Joi.string().required().messages({
        'string.empty': 'El nombre del ejercicio no puede estar vacío.',
        'any.required': 'El nombre del ejercicio es obligatorio.'
    }),
    categoria: Joi.string().required().messages({
        'string.empty': 'La categoría del ejercicio no puede estar vacía.',
        'any.required': 'La categoría del ejercicio es obligatoria.'
    }),
    descripcion: Joi.string().optional().allow('').messages({
        'string.empty': 'La descripción del ejercicio no puede estar vacía.'
    }),
    musculoPpal: Joi.string().required().messages({
        'string.empty': 'El músculo principal no puede estar vacío.',
        'any.required': 'El músculo principal es obligatorio.'
    }),
    otrosMusculos: Joi.array().items(Joi.string()).optional().messages({
        'array.base': 'Otros músculos deben ser una lista de cadenas.'
    }),
    video: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'El video debe ser una URL válida.'
    }),
    disponible: Joi.boolean().default(true).messages({
        'boolean.base': 'Disponible debe ser verdadero o falso.'
    }),
});

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

    ejercicios: Joi.array()
    .items(ejercicioSchema)
    .min(1)
    .required()
    .messages({
        'array.min': 'Debe seleccionar al menos {#limit} ejercicio(s).',
        'any.required': 'Los ejercicios son obligatorios.'
    }),

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
    
    ejercicios: Joi.array()
    .items(ejercicioSchema)
    .min(1)
    .required()
    .messages({
        'array.base': 'Los ejercicios deben estar en un formato de arreglo.',
        'array.min': 'Debe haber al menos {#limit} ejercicio(s).',
        'any.required': 'La lista de ejercicios es obligatoria.'
    }),
    
    disponible: Joi.boolean()
    .default(true)
});


ruta.get('/', autentificarToken , async (req, res) => {
    try {
        let rutinas = await listarRutinas();
        res.json(rutinas)
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/', autentificarToken , async (req, res) => {
    let body = req.body;

    const { error, value } = schema.validate({
        nombre: body.nombre,
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
        const rutina = await crearRutina(value);
        res.json({ valor: rutina });
    } catch (err) {
        res.status(400).json({ err: err.message });
    }
});

ruta.put('/:id', autentificarToken , async (req, res) => {
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

ruta.put('/:id/deshabilitar', autentificarToken ,async (req, res) => {
    const { id } = req.params;
    try {
      const rutinaActualizada = await deshabilitarRutina(id);
      res.json(rutinaActualizada);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

async function crearRutina(data) {
    const rutina = new Rutina(data);
    return await rutina.save();
}

async function deshabilitarRutina(id) {
    try {
      const rutina = await Rutina.findByIdAndUpdate(id, { disponible: false });
      if (!rutina) {
        throw new Error('Rutina no encontrada');
      }
      return rutina;
    } catch (error) {
      throw new Error('Error al deshabilitar rutina: ' + error.message);
    }
}

async function listarRutinas(){
    let rutinas = await Rutina.find().populate('ejercicios');
    return rutinas;
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