const express = require('express');
const Avance = require('../models/avance_model');
const ruta = express.Router();
const autentificarToken = require ('../middleware/autToken');
const autentificarTokenNotAdmin = require('../middleware/autTokenNotAdmin');




// Ruta para obtener avances del usuario y ejercicio
ruta.get('/usuarioEjercicio', autentificarTokenNotAdmin, async (req, res) => {
   // const idUsuario = req.usuario;
    const idEjercicio = req.query.ejercicio;

    // console.log("idUsuario:", idUsuario);
    // console.log("idEjercicio:", idEjercicio);

    try {

        const { usuario } = req.query; 
        if (!usuario) {
          return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
        }
    
        console.log(usuario);
        let avancesUsuario = await obtenerAvancesEjercicio(usuario, idEjercicio);
        
        if (!avancesUsuario || avancesUsuario.length === 0) {
            res.json(null);
        } else {
            res.json(avancesUsuario);
        }
    } catch (err) {
        console.error("Error en el catch:", err);
        res.status(400).json({ error: 'Error al obtener los avances' });
    }
});

async function obtenerAvancesEjercicio(idUsuario, idEjercicio) {
    try {
        let query = { usuario: idUsuario };
        if (idEjercicio) {
            query.ejercicio = idEjercicio;
        }
        
        let avances = await Avance.find(query).sort({ fecha: 1 });
        // console.log(avances);
        return avances;
    } catch (error) {
        console.error('Error obteniendo avances:', error);
        throw error;
    }
}

ruta.post('/avanceEjercicios', autentificarTokenNotAdmin, async (req, res) => {
    try {
      
        const avance = await crearAvanceEjercicio(req.body, req.usuario); 
        res.json({ value: avance });
        // console.log("Este es el avance creado recién: " + avance._id);
    } catch (err) {
        console.log("Error en catch: ", err);
        res.status(400).json({ error: 'Error al registrar el avance' });
    }
});

async function crearAvanceEjercicio(body, usuario) {
//   console.log(body.ejercicio)
    let avance = new Avance({
        fecha: new Date(), 
        usuario: usuario._id, 
        valorNumerico: body.peso,
        ejercicio: body.ejercicio
    });
//    console.log(avance);
   return await avance.save();
}

// Ruta para obtener avances del usuario y ejercicio
ruta.get('/usuarioPeso', autentificarTokenNotAdmin, async (req, res) => {
   // const idUsuario = req.usuario;

    try {
        const { usuario } = req.query; 
        if (!usuario) {
          return res.status(400).json({ error: 'Parámetros requeridos faltantes' });
        }
    
        console.log(usuario);
        let avancesUsuario = await obtenerAvancesPeso(usuario);
        
        if (!avancesUsuario || avancesUsuario.length === 0) {
            res.json(null);
        } else {
            res.json(avancesUsuario);
        }
    } catch (err) {
        console.error("Error en el catch:", err);
        res.status(400).json({ error: 'Error al obtener los avances' });
    }
});

async function obtenerAvancesPeso(idUsuario) {
    try {
        let query = {
            usuario: idUsuario,
            ejercicio: { $eq: null } 
        };
        
        let avances = await Avance.find(query).sort({ fecha: 1 });
        console.log(avances);
        return avances;
    } catch (error) {
        console.error('Error obteniendo avances:', error);
        throw error;
    }
}



ruta.post('/usuarioPeso', autentificarTokenNotAdmin, async (req, res) => {
    try {
      
        const avance = await crearAvancePeso(req.body, req.usuario); 
        res.json({ value: avance });
        console.log("Este es el avance creado recién: " + avance._id);
    } catch (err) {
        console.log("Error en catch: ", err);
        res.status(400).json({ error: 'Error al registrar el avance' });
    }
});


async function crearAvancePeso (body, usuario) {
    console.log(body.ejercicio)
      let avance = new Avance({
          fecha: new Date(), 
          usuario: usuario._id, 
          valorNumerico: body.peso
      });
     console.log(avance);
     return await avance.save();
  }

module.exports = ruta;