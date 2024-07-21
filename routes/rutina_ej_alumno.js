const express = require('express');
const ruta = express.Router();
const Joi = require('@hapi/joi');
const RutinaEjercicioAlumno = require('../models/rutina_ej_alumno_model');

const updateSchema = Joi.object({
  series: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Las series deben ser un número.',
      'number.integer': 'Las series deben ser un número entero.',
      'any.required': 'Las series son obligatorias.'
    }),
  repeticiones: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Las repeticiones deben ser un número.',
      'number.integer': 'Las repeticiones deben ser un número entero.',
      'any.required': 'Las repeticiones son obligatorias.'
    }),
  peso: Joi.number()
    .integer()
    .messages({
      'number.base': 'El peso debe ser un número.',
      'number.integer': 'El peso debe ser un número entero.'
    }),
  observaciones: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Las observaciones deben ser un texto.'
    }),
  completado: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'El campo completado debe ser un valor booleano.'
    })
});

const schema = Joi.object({
  rutina: Joi.string().length(24).hex().required().messages({
    'string.length': 'El ID de la rutina debe tener 24 caracteres.',
    'string.hex': 'El ID de la rutina debe ser una cadena hexadecimal válida.',
    'any.required': 'El ID de la rutina es obligatoria.'
  }),
  ejercicio: Joi.string().length(24).hex().required().messages({
    'string.length': 'El ID del ejercicio debe tener 24 caracteres.',
    'string.hex': 'El ID del ejercicio debe ser una cadena hexadecimal válida.',
    'any.required': 'El ID del ejercicio es obligatorio.'
  }),
  usuario: Joi.string().length(24).hex().required().messages({
    'string.length': 'El ID del usuario debe tener 24 caracteres.',
    'string.hex': 'El ID del usuario debe ser una cadena hexadecimal válida.',
    'any.required': 'El ID del usuario es obligatorio.'
  }),
  fecha: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha debe ser una fecha válida.',
      'any.required': 'La fecha es obligatoria.'
    }),
  series: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Las series deben ser un número.',
      'number.integer': 'Las series deben ser un número entero.',
      'any.required': 'Las series son obligatorias.'
    }),
  repeticiones: Joi.number()
    .integer()
    .required()
    .messages({
      'number.base': 'Las repeticiones deben ser un número.',
      'number.integer': 'Las repeticiones deben ser un número entero.',
      'any.required': 'Las repeticiones son obligatorias.'
    }),
  peso: Joi.number()
    .integer()
    .messages({
      'number.base': 'El peso debe ser un número.',
      'number.integer': 'El peso debe ser un número entero.'
    }),
  observaciones: Joi.string()
    .optional()
    .allow('')
    .messages({
      'string.base': 'Las observaciones deben ser un texto.'
    }),
  completado: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'El campo completado debe ser un valor booleano.'
    })
});

ruta.get('/', async (req, res) => {
  try {
    const rutinaEjercicioAlumnos = await RutinaEjercicioAlumno.find()
      .populate('rutina')
      .populate('ejercicio')
      .populate('usuario')
      .exec();
    res.status(200).json(rutinaEjercicioAlumnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las rutinas de ejercicio de alumnos' });
  }
});

ruta.get('/usuario',  async (req, res) => {
  try {
      const { usuario } = req.query;
      let rutina_ej_alumno = await obtenerEjerciciosDelAlumno(usuario);
      res.json(rutina_ej_alumno);
  } catch (err) {
      console.error('Error al listar los ejercicios del alumno:', err);
      res.status(400).json({ err });
  }
});

// POST: Crear una nueva rutina_ejercicio_alumno
ruta.post('/', async (req, res) => {
  try {
    const { rutina, ejercicio, usuario, fecha, series, repeticiones, peso, observaciones, completado } = req.body;

    const { error, value } = schema.validate({
      rutina,
      ejercicio,
      usuario,
      fecha,
      series,
      repeticiones,
      peso,
      observaciones,
      completado
    });
    
    // Si hay un error de validación, responde con el error
    if (error) {
      const detailedErrors = error.details.map(detail => ({
          message: detail.message,
          path: detail.path
      }));
      return res.status(400).json({ error: detailedErrors });
  }

    const rutina_ej_alumno = await crearRutina_ej_alumno(value);
    res.json({ valor: rutina_ej_alumno });
  } catch (err) {
    res.status(400).json({ err: err.message });
}
});

// PUT: Actualizar una rutina_ejercicio_alumno por ID
ruta.put('/:id', async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const { error, value } = updateSchema.validate({
    series: body.series,
    repeticiones: body.repeticiones,
    peso: body.peso,
    observaciones: body.observaciones,
    completado: body.completado
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
    const updatedRutinaEjercicioAlumno = await RutinaEjercicioAlumno.findByIdAndUpdate(id, value, { new: true });
      
    if (!updatedRutinaEjercicioAlumno) {
      return res.status(404).json({ error: 'El ejercicio del alumno no fue encontrado' });
    }
    res.status(200).json(updatedRutinaEjercicioAlumno);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el ejercicio del alumno' });
  }
});

// DELETE: Eliminar una rutina_ejercicio_alumno por ID
ruta.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRutinaEjercicioAlumno = await RutinaEjercicioAlumno.findByIdAndDelete(id).exec();
    if (!deletedRutinaEjercicioAlumno) {
      return res.status(404).json({ error: 'Rutina de ejercicio de alumno no encontrada' });
    }
    res.status(200).json({ message: 'Rutina de ejercicio de alumno eliminada' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la rutina de ejercicio de alumno' });
  }
});

async function crearRutina_ej_alumno(data) {
  const rutina_ej_alumno = new RutinaEjercicioAlumno(data);
  return await rutina_ej_alumno.save();
}

async function obtenerEjerciciosDelAlumno(usuario) {
  let query = {}; 

  if (usuario) {
    query.usuario = usuario; 
  }
  console.log(query);
  let ejercicios = await RutinaEjercicioAlumno.find(query).populate('ejercicio').populate('rutina');
  return ejercicios;
}

module.exports = ruta;
