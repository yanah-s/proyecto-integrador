const express = require('express');
//const Usuario = require('../models/usuario_model');
const Agenda = require('../models/agenda_model');
const Disponibilidad = require('../models/disponibilidad_model');
const ruta = express.Router();
const Joi = require('@hapi/joi');

const schema = Joi.object({
    fecha: Joi.date()
        .iso()
        .required(),

    hora_desde: Joi.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required(),

    hora_hasta: Joi.string()
        .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
        .required()

});

//Obtener todas las fechas disponibles
ruta.get('/', async (req, res) => {
    try {
        const disponibilidades = await Disponibilidad.find();
    
        if (disponibilidades.length === 0) {
          return res.status(404).json({ mensaje: 'No se encontraron disponibilidades.' });
        }
    
        res.status(200).json(disponibilidades);
      } catch (error) {
        console.error('Error al obtener las disponibilidades:', error);
        res.status(500).json({ mensaje: 'Error al obtener las disponibilidades.' });
      }
});

//Crear una fecha de disponibilidad
ruta.post('/', async (req, res) => {
    try {
        const { fecha, hora_desde, hora_hasta } = req.body;

        const {error, value} = schema.validate({fecha: fecha, hora_desde: hora_desde, 
            hora_hasta : hora_hasta});

        // if (!fecha || !hora_desde || !hora_hasta) {
        //     return res.status(400).send('Debe completar todos los campos');
        // }

        const fechaObj = new Date(fecha);
        if (isNaN(fechaObj)) {
          return res.status(400).send('Fecha inválida');
        }

        const nuevaDisponibilidad = new Disponibilidad({
          fecha: fechaObj,
          hora_desde: hora_desde,
          hora_hasta: hora_hasta
        });
    
        await nuevaDisponibilidad.save();
    
        res.status(201).json(nuevaDisponibilidad);
      } catch (error) {
        console.error('Error al crear la disponibilidad:', error);
        res.status(500).json({ mensaje: 'Error al crear la disponibilidad.' });
      }
});

// Buscar y actualizar los datos de la fecha seleccionada
ruta.put('/:id', async(req, res) => {
    try {
        const disponibilidadActualizada = await Disponibilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
        if (!disponibilidadActualizada) {
            return res.status(404).json({ mensaje: 'Disponibilidad no encontrada.' });
        }
    
        res.status(200).json(disponibilidadActualizada);
    } catch (error) {
    console.error('Error al actualizar la disponibilidad:', error);
    res.status(400).json({ mensaje: 'Error al actualizar la disponibilidad.' });
    }
});

// Buscar y eliminar la fecha disponible seleccionada
ruta.delete('/:id', async (req, res) => {
    try {
        const disponibilidadEliminada = await Disponibilidad.findByIdAndDelete(req.params.id);
    
        if (!disponibilidadEliminada) {
          return res.status(404).json({ mensaje: 'Disponibilidad no encontrada.' });
        }
    
        res.status(200).json({ mensaje: 'Disponibilidad eliminada exitosamente.' });
    } catch (error) {
    console.error('Error al eliminar la disponibilidad:', error);
    res.status(400).json({ mensaje: 'Error al eliminar la disponibilidad.' });
    }
});

// function convertirHoraAMinutos(hora) {
//   const [horas, minutos] = hora.split(':').map(Number);
//   return horas * 60 + minutos;
// }


module.exports = ruta;