const mongoose = require('mongoose');
const Ejercicio = require('./ejercicio_model'); 
const Rutina = require('./rutina_model');
const Usuario = require('./usuario_model');

const rutina_ej_alumnoSchema = new mongoose.Schema({
    rutina: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'rutina', 
        required: true 
    },
    ejercicio: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ejercicio', 
        required: true 
    },
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    fecha: { 
        type: Date, 
        required: true 
    },
    observaciones: { type: String },
    series: { 
        type: Number, 
        required: true 
    },
    repeticiones: { 
        type: Number, 
        required: true 
    },
    completado: { 
        type: Boolean, 
        default: false 
    }
});
  
module.exports = mongoose.model('rutina_ej_alumno', rutina_ej_alumnoSchema);