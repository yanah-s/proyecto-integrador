const express = require('express');
const ruta = express.Router();
const Joi = require('@hapi/joi');
const RutinaEjercicioAlumno = require('../models/rutina_ej_alumno_model');
const autentificarTokenNotAdmin = require ('../middleware/autTokenNotAdmin');
const autentificarToken = require('../middleware/autToken');
const Usuario = require('../models/usuario_model');

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

ruta.get('/',autentificarTokenNotAdmin, async (req, res) => {
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

ruta.get('/usuario',autentificarTokenNotAdmin,  async (req, res) => {
  try {
      const { usuario, fecha } = req.query;
      console.log(`Usuario: ${usuario}, Fecha: ${fecha}`); 
      if (!usuario) {
        return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
      }
      let rutina_ej_alumno = await obtenerEjerciciosDelAlumno(usuario, fecha);
      console.log(rutina_ej_alumno);
      res.json(rutina_ej_alumno || []);
  } catch (err) {
      console.error('Error al listar los ejercicios del alumno:', err);
      res.status(400).json({ err });
  }
});

// POST: Crear una nueva rutina_ejercicio_alumno
ruta.post('/',autentificarToken, async (req, res) => {
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

    const user = await Usuario.findById(usuario);
     const message = "Tienes una nueva rutina disponible!";
    const newNotification = {
        message,
        read: false,
        timestamp: Date.now()
    };
    await user.updateOne(
        { $push: { notificacionesUsuario: newNotification } }
    );
    res.json({ valor: rutina_ej_alumno });


  } catch (err) {
    console.log("explota en el catch");
    res.status(400).json({ err: err.message });
} 
});

// PUT: Actualizar una rutina_ejercicio_alumno por ID
ruta.put('/:id',autentificarTokenNotAdmin, async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  console.log(req.body);
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
      return res.status(400).json({ error: detailedErrors });
  }

  try {

    const updatedRutinaEjercicioAlumno = await RutinaEjercicioAlumno.findByIdAndUpdate(id, value, { new: true });

    if (!updatedRutinaEjercicioAlumno) {
      return res.status(404).json({ error: 'El ejercicio del alumno no fue encontrado' });
    }
   
    
    // Notificación
    console.log("GENERANDO NOTIFICACION!");
    const userId = req.headers['user-id'];
    const rutina = await RutinaEjercicioAlumno.findById(id);
    const usuarioRutina = await Usuario.findById(rutina.usuario);
    const usuarioAdmin = await Usuario.findOne({ administrador: true });
    console.log("USER ID" + userId);
    console.log("RUTINA" + rutina);
    console.log("USUARIO DE RUTINA" + usuarioRutina);
    console.log("USUARIO ADMIN" + usuarioAdmin);
    let message;
    let targetUser;
    const fecha = rutina.fecha;

    // Obtener el día, mes y año
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Los meses van de 0 a 11
    const anio = fecha.getFullYear();

    // Formatear la fecha
    const fechaFormateada = `${dia}/${mes}/${anio}`;
    if (userId !== usuarioAdmin._id.toString()) {
      // Mensaje para el administrador
      message = `${usuarioRutina.nombre} ha dejado una nota en su rutina el ${fechaFormateada}!`;
      targetUser = usuarioAdmin;
    } else {
      // Mensaje para el usuario de la rutina
      message = `Tienes una nueva nota en tu rutina del ${fechaFormateada}!`;
      targetUser = usuarioRutina;
    }

    const newNotification = {
      message,
      read: false,
      timestamp: Date.now()
    };

    await targetUser.updateOne(
      { $push: { notificacionesUsuario: newNotification } }
    );

    res.status(200).json(updatedRutinaEjercicioAlumno);
  } catch (error) {
    console.error('Error al actualizar el ejercicio del alumno:', error);
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


ruta.get('/porcentaje', autentificarTokenNotAdmin, async (req, res) => {
  try {
    const { usuario } = req.query; 
    if (!usuario) {
      return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
    }

    console.log(usuario);
    let { porcentaje, totalDiasConEjercicios, totalDiasSinEjercicios } = await obtenerEjerciciosDelAlumnoMes(usuario);

    res.json({ porcentaje, totalDiasConEjercicios, totalDiasSinEjercicios });
  } catch (err) {
    console.error('Error al listar los ejercicios del alumno:', err);
    res.status(400).json({ error: 'Error al listar los ejercicios del alumno' });
  }
});
async function obtenerEjerciciosDelAlumnoMes(usuario) {
  const estemes = new Date().getMonth() + 1; // Ajuste para MongoDB

  try {
    // Buscar los ejercicios del alumno para el mes actual
    const rutinaEjercicioAlumnos = await RutinaEjercicioAlumno.find({
      usuario: usuario,
      $expr: { $eq: [{ $month: "$fecha" }, estemes] } // $month devuelve meses de 1 a 12
    });

    // Mapas para días con y sin ejercicios
    const diasConEjercicios = new Set();
    const diasSinEjercicios = new Set();

    rutinaEjercicioAlumnos.forEach((rutina) => {
      // Obtener el día de la fecha
      const dia = rutina.fecha.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      // Verificar si hay al menos un booleano en true
      const hizoEjercicio = typeof rutina.completado === 'boolean' && rutina.completado;

      if (hizoEjercicio) {
        diasConEjercicios.add(dia);
      } else {
        diasSinEjercicios.add(dia);
      }
    });

    const totalDiasConEjercicios = diasConEjercicios.size;
    // Remover los días que ya están en diasConEjercicios de diasSinEjercicios
    diasConEjercicios.forEach(dia => diasSinEjercicios.delete(dia));
    const totalDiasSinEjercicios = diasSinEjercicios.size;
    const total = totalDiasConEjercicios + totalDiasSinEjercicios;

    const porcentaje = total > 0 ? (totalDiasConEjercicios * 100) / total : 0;
    console.log(totalDiasConEjercicios, totalDiasSinEjercicios);
    return { porcentaje, totalDiasConEjercicios, totalDiasSinEjercicios };
  } catch (error) {
    console.error("Error al obtener los ejercicios:", error);
    return { porcentaje: 0, totalDiasConEjercicios: 0, totalDiasSinEjercicios: 0 };
  }
}



async function crearRutina_ej_alumno(data) {
  const rutina_ej_alumno = new RutinaEjercicioAlumno(data);
  return await rutina_ej_alumno.save();
}

async function obtenerEjerciciosDelAlumno(usuario, fecha) {
  let query = {};

  if (usuario) {
    query.usuario = usuario;
  }

  if (fecha) {
    // Convierte la fecha en formato ISO 8601
    const startOfDay = new Date(fecha);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(startOfDay.getDate() + 1);

    query.fecha = {
      $gte: startOfDay,
      $lt: endOfDay
    };
  }

  console.log('Consulta:', query);
  const ejercicios = await RutinaEjercicioAlumno.find(query).populate('rutina').populate('ejercicio');

  if (fecha) {
    // Agrupa los ejercicios por rutina solo si se pasa una fecha
    const rutinaEjercicios = ejercicios.reduce((acc, ejercicio) => {
      const rutinaId = ejercicio.rutina._id;
      if (!acc[rutinaId]) {
        acc[rutinaId] = {
          rutina: ejercicio.rutina,
          ejercicios: []
        };
      }
      acc[rutinaId].ejercicios.push(ejercicio);
      return acc;
    }, {});

    return Object.values(rutinaEjercicios);
  } else {
    // Si no se pasa una fecha, retorna los ejercicios sin agrupar
    return ejercicios;
  }
}

module.exports = ruta;
