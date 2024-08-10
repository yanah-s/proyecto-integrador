const express = require('express');
const ruta = express.Router();
const Joi = require('@hapi/joi');
const ObjetivoMetaUsuario = require('../models/objetivo_meta_usuario_model');
const autentificarToken = require ('../middleware/autToken');
const autentificarTokenNotAdmin = require('../middleware/autTokenNotAdmin');

const updateSchema = Joi.object({
    fechaDesde: Joi.date()
        .required()
        .messages({
          'date.base': 'La fecha desde debe ser una fecha válida.',
          'any.required': 'La fecha desde es obligatoria.'
    }),
    fechaHasta: Joi.date()
        .required()
        .messages({
          'date.base': 'La fecha hasta debe ser una fecha válida.',
          'any.required': 'La fecha hasta es obligatoria.'
    }),
    valor: Joi.number()
        .integer()
        .allow('')
        .messages({
          'number.base': 'El valor debe ser un número.',
          'number.integer': 'El valor debe ser un número entero.',
    }),
    cumplido: Joi.boolean()
        .default(false)
        .messages({
            'boolean.base': 'El campo cumplido debe ser un valor booleano.'
    }) 
});

const schema = Joi.object({
  objetivoMeta: Joi.string().length(24).hex().required().messages({
    'string.length': 'El ID del objetivo o meta debe tener 24 caracteres.',
    'string.hex': 'El ID del objetivo o meta debe ser una cadena hexadecimal válida.',
    'any.required': 'El ID del objetivo o meta es obligatorio.'
  }),
  usuario: Joi.string().length(24).hex().required().messages({
    'string.length': 'El ID del usuario debe tener 24 caracteres.',
    'string.hex': 'El ID del usuario debe ser una cadena hexadecimal válida.',
    'any.required': 'El ID del usuario es obligatorio.'
  }),
  fechaDesde: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha desde debe ser una fecha válida.',
      'any.required': 'La fecha desde es obligatoria.'
    }),
  fechaHasta: Joi.date()
    .required()
    .messages({
      'date.base': 'La fecha hasta debe ser una fecha válida.',
      'any.required': 'La fecha hasta es obligatoria.'
    }),
  valor: Joi.number()
    .integer()
    .allow('')
    .messages({
      'number.base': 'El valor debe ser un número.',
      'number.integer': 'El valor debe ser un número entero.',
    }),
  creadoAdmin: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'El campo creadoAdmin debe ser un valor booleano.'
    }),
  cumplido: Joi.boolean()
    .default(false)
    .messages({
      'boolean.base': 'El campo cumplido debe ser un valor booleano.'
    })  
});

ruta.get('/',autentificarTokenNotAdmin, async (req, res) => {
  try {
    const objetivoMetaUsuario = await ObjetivoMetaUsuario.find()
      .populate('objetivoMeta')
      .populate('usuario')
      .exec();
    res.status(200).json(objetivoMetaUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los objetivos y metas del usuario' });
  }
});

ruta.get('/usuario',autentificarTokenNotAdmin,  async (req, res) => {
  try {
      const { usuario} = req.query;
      if (!usuario) {
        return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
      }
      let objetivo_meta_usuario = await obtenerObjetivoMetaDelUsuario(usuario);
      res.json(objetivo_meta_usuario);
  } catch (err) {
      console.error('Error al listar los objetivos y metas del usuario:', err);
      res.status(400).json({ err });
  }
});

ruta.post('/',autentificarTokenNotAdmin, async (req, res) => {
  try {
    const { objetivoMeta, usuario, fechaDesde, fechaHasta, valor, creadoAdmin, cumplido } = req.body;

    const { error, value } = schema.validate({
        objetivoMeta,
        usuario,
        fechaDesde,
        fechaHasta,
        valor,
        creadoAdmin,
        cumplido
    });
    
    if (error) {
        const detailedErrors = error.details.map(detail => ({
            message: detail.message,
            path: detail.path
        }));
        return res.status(400).json({ error: detailedErrors });
    }

    const objetivo_meta_usuario = await crearObjetivo_meta_usuario(value);
    res.json({ valor: objetivo_meta_usuario });
  } catch (err) {
    res.status(400).json({ err: err.message });
} 
});

ruta.put('/:id',autentificarTokenNotAdmin, async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  const { error, value } = updateSchema.validate({
    fechaDesde: body.fechaDesde,
    fechaHasta: body.fechaHasta,
    valor: body.valor,
    cumplido: body.cumplido,
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
    const objetivoMetaActualizada = await ObjetivoMetaUsuario.findByIdAndUpdate(id, value, { new: true });

    if (!objetivoMetaActualizada) {
      return res.status(404).json({ error: 'El objetivo o meta seleccionado no fue encontrado' });
    }
    res.status(200).json(objetivoMetaActualizada);
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el objetivo o meta seleccionado' });
  }
});

ruta.delete('/:id',autentificarTokenNotAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const objetivoMetaEliminado = await ObjetivoMetaUsuario.findByIdAndDelete(id).exec();
    if (!objetivoMetaEliminado) {
      return res.status(404).json({ error: 'Objetivo o meta no encontrado' });
    }
    res.status(200).json({ message: 'Objetivo o meta eliminada' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el objetivo o meta seleccionado', error });
  }
});

async function crearObjetivo_meta_usuario(data) {
  const objetivo_meta_usuario = new ObjetivoMetaUsuario(data);
  return await objetivo_meta_usuario.save();
}

async function obtenerObjetivoMetaDelUsuario(usuario) {
    let query = {};

    if (usuario) {
      query.usuario = usuario;
    }

    const objetivosMetas = await ObjetivoMetaUsuario.find(query).populate('objetivoMeta');

    return objetivosMetas;
}

module.exports = ruta;
