const express = require('express');
const Usuario = require('../models/usuario_model');
const Agenda = require('../models/agenda_model');
const Disponibilidad = require('../models/disponibilidad_model');
const ruta = express.Router();
const Joi = require('@hapi/joi');

//Validacion de los parametros de la agenda
const schema = Joi.object({
  fecha: Joi.date()
    .iso()
    .required(),
  id_usuario: Joi.string()
    .required()
});

//Obtener todas las reservas
ruta.get('/', async (req, res) => {
  try {
      let agendas = await Agenda.find().populate('id_usuario', ['nombre', 'email']);
      res.json(agendas);
  } catch (err) {
      res.status(400).json({ err });
  }
});

//Crear una reserva
ruta.post('/', async (req, res) => {
  let {id_usuario, fecha, observacion, presencial} = req.body;

  try {
      // Convertir fecha a objeto Date
      const fechaObj = new Date(fecha);
      const dia = fechaObj.toISOString().split('T')[0];
      const hora = fechaObj.toTimeString().split(' ')[0].substring(0, 5);
  
      // Verificar disponibilidad
      const disponibilidad = await Disponibilidad.findOne({ fecha: dia });
  
      if (disponibilidad) {
        const horaMinutos = convertirHoraAMinutos(hora);
        const desdeMinutos = convertirHoraAMinutos(disponibilidad.hora_desde);
        const hastaMinutos = convertirHoraAMinutos(disponibilidad.hora_hasta);
  
        if (horaMinutos >= desdeMinutos && horaMinutos <= hastaMinutos) {
          const rangoInicio = new Date(fechaObj);
          rangoInicio.setHours(rangoInicio.getHours() - 1);
          
          const rangoFin = new Date(fechaObj);
          rangoFin.setHours(rangoFin.getHours() + 1);
          
          const agendaExistente = await Agenda.findOne({
            fecha: {
              $gte: rangoInicio,
              $lte: rangoFin
            }
          });
        
          if (agendaExistente) {
            return res.status(400).json({ error: 'Ya existe una agenda en el rango de una hora del horario solicitado' });
          }

          const cita = new Agenda({id_usuario, fecha: fechaObj, observacion, presencial});
          await cita.save();
          return res.json(cita);
        } else {
          return res.status(400).json({ error: 'Hora no disponible' });
        }
      } else {
        return res.status(400).json({ error: 'Día no disponible' });
      }
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Buscar y actualizar el registro de la agenda por ID de usuario
ruta.put('/:id', async(req, res) => {

  try {
      const id_usuario = req.params.id_usuario;
      const nuevaFecha = req.body.nuevaFecha;
  
      const updatedAgenda = await Agenda.findOneAndUpdate({ id_usuario: id_usuario }, { fecha: nuevaFecha }, { new: true });
  
      if (!updatedAgenda) {
        return res.status(404).json({ message: 'Registro no encontrado para el ID de usuario proporcionado.' });
      }
  
      res.json({ message: 'Registro actualizado exitosamente.', updatedAgenda });
    } catch (error) {
      console.error('Error al actualizar registro de la agenda:', error);
      res.status(500).json({ message: 'Error interno del servidor al actualizar el registro.' });
    }

    
});

// Buscar y eliminar el registro de la agenda por ID de usuario
ruta.delete('/:id', async (req, res) => {
  try {
    const userId = req.params.id_usuario;
    
    const deletedAgenda = await Agenda.findOneAndDelete({ id_usuario: id });

    if (!deletedAgenda) {
      return res.status(404).json({ message: 'Registro no encontrado para el ID de usuario proporcionado.' });
    }

    res.json({ message: 'Registro eliminado exitosamente.', deletedAgenda });
  } catch (error) {
    console.error('Error al eliminar registro de la agenda:', error);
    res.status(500).json({ message: 'Error interno del servidor al eliminar el registro.' });
  }
});

function convertirHoraAMinutos(hora) {
  const [horas, minutos] = hora.split(':').map(Number);
  return horas * 60 + minutos;
}


module.exports = ruta;