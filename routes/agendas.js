const express = require('express');
const Agenda = require('../models/agenda_model');
const Usuario = require('../models/usuario_model');
const ruta = express.Router();
const Joi = require('@hapi/joi');
const moment = require('moment-timezone');
const autentificarToken = require ('../middleware/autToken');
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
ruta.post('/', autentificarToken ,async (req, res) => {

  console.log(req.data);
  if (req.isAdmin) {
   
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
          id_usuario: null, 
          
        });
        
        for (const intervalo of intervalos) {
          console.table(intervalos);
          try {
            const intervaloItem = new Agenda(intervalo);
            await intervaloItem.save();

            agendaItems.push(intervaloItem);

            console.log("agenda intems" + agendaItems);
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
}else {
  res.status(403).json({ message: 'No tienes permisos de administrador.' });
}
});

ruta.put('/', (req, res) => {
 
  try{
    const { usuarioId, turnoId } = req.body; 
    console.log("este es el ID QUE LLEGA"+ usuarioId);
   let resultado = agendarUsuario(usuarioId, turnoId);
   console.log(resultado);
   resultado.then(valor => {
       res.json({
           valor
       });
   }).catch(err => {
       res.status(400).json({
           error: 'Error al actualizar turno'
       });
   });
  }catch{
    console.log("este es el req"+ req.object);
   res.status(400).json({
       error: 'Datos inválidos'
   });
  }
     
});

async function agendarUsuario(id_usuario, id_turno){
  console.log("llega a funcion agendar");
  try {
      let usuario = await Usuario.findById(id_usuario);
      console.log("usuario encontrado"+usuario);
      let agenda = await Agenda.findById(id_turno);
      console.log("agenda encontrado"+agenda);
      if (!usuario) {
        console.log("usuario NO encontrado"+id_usuario);
          throw new Error('Usuario no encontrado');
      }
      else if(!agenda) {
        throw new Error('turno no encontrado');
      }

      agenda.id_usuario = id_usuario;

      await agenda.save();

      return agenda;
  } catch (err) {
      throw new Error('Error al agendar usuario: ' + err.message);
  }
}

ruta.get('/turnos',autentificarToken, async (req, res) => {
 
  try {
    let turnosAgenda = await listarTurnos();
    
    if(!turnosAgenda) {
      res.json(null);
    }else{
      console.log(turnosAgenda);
      res.json(turnosAgenda);
    }
   
  } catch (err) {
    console.error('Error al obtener los turnos:', err);
    res.status(400).json({ error: 'Error al obtener los turnos' });
  }
});


ruta.delete('/:idTurno', autentificarToken, async (req, res) => {
  console.log(req.isAdmin);
  if (req.isAdmin) {
      try {
          const idTurno = req.params.idTurno;
          console.log(idTurno)
          await eliminarTurno(idTurno);
          res.json("Turno eliminado exitosamente");
      } catch (err) {
          console.error('Error al eliminar el turno:', err.message);
          res.status(400).json({ error: err.message });
      }
  } else {
    console.log("sin permisos");
      res.status(403).json({ message: 'No tienes permisos de administrador.' });
     
  }
});


async function eliminarTurno(id) {
  try {
    const turno = await Agenda.findById(id);
    if (!turno) {
      throw new Error('El turno no existe');
    }
    await turno.deleteOne();
  } catch (err) {
    throw new Error(`Error al eliminar el turno: ${err.message}`);
  }
}


ruta.get('/', async (req, res) => {
 console.log("en turnos disponibles llega"+ req.data);
  try {
    let turnos = await listarTurnosDisponibles();
  //  console.log(turnos);
     res.json(turnos);
  } catch (err) {
    console.error('Error al obtener los turnos:', err);
    res.status(400).json({ error: 'Error al obtener los turnos' });
  }
});

// Función para listar todos los turnos de la base de datos
async function listarTurnos() {
  let turnos = await Agenda.find();
  return turnos;
}

// Función para listar todos los turnos de la base de datos
async function listarTurnosDisponibles() {
  let turnos = await Agenda.find({id_usuario :null});
  return turnos;
}
module.exports = ruta;
