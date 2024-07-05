const mongoose = require('mongoose');
const Ejercicio = require('./ejercicio_model'); 

const rutinaSchema = new mongoose.Schema({
    nombre: {
        type:String,
        required:true
    },
    categoria: {
        type:String,
        required: true
    },
    ejercicios: [Ejercicio.schema],
    disponible: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model('rutina', rutinaSchema);