const express = require('express');
const Agenda = require('../models/agenda_model');
const ruta = express.Router();
const Joi = require('@hapi/joi');
const moment = require('moment-timezone');

// Validación de los parámetros de la agenda
const schema = Joi.object({
  fecha: Joi.date().required(),
  hora_desde: Joi.date().required(),
  hora_hasta: Joi.date().required(),
  id_usuario: Joi.string().allow(null),
});

// // Función para dividir los turnos en intervalos de 30 minutos
const dividirTurnosEnIntervalos = (turno) => {
  const { fecha, hora_desde, hora_hasta, id_usuario } = turno;
  const intervalos = [];
  let inicio = moment.tz(hora_desde, 'America/Montevideo');
  const fin = moment.tz(hora_hasta, 'America/Montevideo');

  // console.log("hora inicio" + inicio.format());
  // console.log("hora fin" + fin.format());
  while (inicio < fin) {
    let proximo = moment(inicio).add(30, 'minutes');

    if (proximo > fin) {
      proximo = moment(hora_hasta);
    }

    intervalos.push({
      fecha: moment(fecha),
      hora_desde: moment(inicio),
      hora_hasta: moment(proximo),
      id_usuario
    });

    inicio = moment(proximo);
  }
  return intervalos;
};

// Ruta para guardar la agenda
ruta.post('/', async (req, res) => {
  const { datos } = req.body;

  console.log("datos recibidos", datos);

  try {
    const agendaItems = [];

    // Itera sobre los datos recibidos y guarda en la base de datos
    for (const fecha in datos) {
      if (datos.hasOwnProperty(fecha)) {
        const { hora_desde, hora_hasta } = datos[fecha];

        // Dividir los turnos en intervalos
         const intervalos = dividirTurnosEnIntervalos({
          fecha: moment(fecha),
          hora_desde: moment(hora_desde),
          hora_hasta: moment(hora_hasta),
          id_usuario: null, // Ajusta según tu lógica de usuario
        });

        for (const intervalo of intervalos) {
          console.table(intervalos);
          try {
            const intervaloItem = new Agenda(intervalo);
            await intervaloItem.save();
            agendaItems.push(intervaloItem);

          } catch (err) {
            console.error('Error al guardar disponibiliad en la base de datos:', err);
            res.status(500).json({ error: 'Error al guardar el intervalo en la base de datos' });
            return;
          }
        }
      }
    }

    res.status(201).json(agendaItems);
  } catch (err) {
    console.error('Error al guardar en la base de datos:', err);
    res.status(500).json({ error: 'Error al guardar en la base de datos' });
  }
});

// Ruta para listar todos los turnos
ruta.get('/', async (req, res) => {
  try {
    let turnos = await listarTurnos();
    res.json(turnos);
  } catch (err) {
    console.error('Error al obtener los turnos:', err);
    res.status(400).json({ error: 'Error al obtener los turnos' });
  }
});

// Función para listar todos los turnos en la base de datos
async function listarTurnos() {
  let turnos = await Agenda.find();
  return turnos;
}

module.exports = ruta;
