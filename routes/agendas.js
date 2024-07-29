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

ruta.post('/', autentificarToken ,async (req, res) => {
  console.log(req.data);
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
          
          // Verificar si el intervalo ya existe en la base de datos
          const intervaloExistente = await Agenda.findOne({
            fecha: intervalo.fecha,
            hora_desde: intervalo.hora_desde,
            hora_hasta: intervalo.hora_hasta
          });

          if (!intervaloExistente) {
            try {
              const intervaloItem = new Agenda(intervalo);
              await intervaloItem.save();

              agendaItems.push(intervaloItem);

              console.log("agenda items" + agendaItems);
            } catch (err) {
              console.error('Error al guardar disponibilidad en la base de datos:', err);
              res.status(500).json({ error: 'Error al guardar el intervalo en la base de datos' });
              return;
            }
          } else {
            console.log(`El intervalo ${intervalo.fecha} de ${intervalo.hora_desde} a ${intervalo.hora_hasta} ya existe`);
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


ruta.put('/',async (req, res) => {
 
  try{
    const { usuarioId, turnoId } = req.body; 
    // const user = Usuario.findById({usuarioId});
   let resultado = agendarUsuario(usuarioId, turnoId);
   console.log(resultado);
   const admin = await Usuario.findOne({ administrador: true });
    const usuarioAgendado = await Usuario.findOne({_id : usuarioId});
    const agenda = await Agenda.findOne({ _id : turnoId});
    const message = "Se agendo un nuevo usuario: " + usuarioAgendado.nombre ;
    const messageUsuario = "Su turno de entrevista quedo agendado para el día "+ agenda.fecha + "a las : "+agenda.hora_desde;
   const newNotification = {
       message,
       read: false,
       timestamp: Date.now()
   };


   await admin.updateOne(
       { $push: { notificacionesUsuario: newNotification } }
   );


   resultado.then
   (valor => {
    
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

      agenda.usuario = usuario;

      await agenda.save();

      return agenda;
  } catch (err) {
      throw new Error('Error al agendar usuario: ' + err.message);
  }
}

ruta.get('/turnos', async (req, res) => {
 
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

ruta.get('/agendaAlumno', async (req, res) => {
 
  try {
    
    const { usuario } = req.query; 
    if (!usuario) {
      console.log("No se encuentra usuario");
      return res.status(400).json({ error: 'No se encuentra usuario' });
    }
    let turno = await turnoParaUsuario(usuario);
    
    if(!turno) {
      res.json(null);
    }else{
      console.log(turno);
      res.json(turno);
    }
   
  } catch (err) {
    console.error('Error al obtener los turnos:', err);
    res.status(400).json({ error: 'Error al obtener los turnos' });
  }
});

async function turnoParaUsuario(usuarioId) {
  try {
    let usuario = await Usuario.findById(usuarioId);
    if (!usuario) {
      console.log("Usuario NO encontrado " + usuarioId);
      throw new Error('Usuario no encontrado');
    }

    const hoy = new Date();
    
    // Buscar turnos a partir de hoy en adelante
    const turno = await Agenda.findOne({
      usuario: usuario._id,
      fecha: { $gte: hoy } // Filtrar turnos con fecha mayor o igual a hoy
    })
    .populate('usuario');
    
    return turno;
  } 
  catch (error) {
    console.error(error);
    return null;
  }
}


ruta.delete('/:idTurno', autentificarToken, async (req, res) => {
  
      try {
          const idTurno = req.params.idTurno;
        //  console.log(idTurno)
          await eliminarTurno(idTurno);
          res.json("Turno eliminado exitosamente");
      } catch (err) {
          console.error('Error al eliminar el turno:', err.message);
          res.status(400).json({ error: err.message });
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
// console.log("en turnos disponibles llega"+ req.data);
  try {
    let turnos = await listarTurnosDisponibles();
    
     res.json(turnos);
  } catch (err) {
    console.error('Error al obtener los turnos:', err);
    res.status(400).json({ error: 'Error al obtener los turnos' });
  }
});

async function listarTurnos() {
  const hoy = new Date();
  const turnos = await Agenda.find({ fecha: { $gte: hoy } })
    .sort({ fecha: 1 }) // Ordenar por fecha ascendente (1 para ascendente, -1 para descendente)
    .populate('usuario');
  return turnos;
}

// Función para listar todos los turnos de la base de datos
async function listarTurnosDisponibles() {
  let turnos = await Agenda.find({usuario :null});
  
  return turnos;
}
module.exports = ruta;
