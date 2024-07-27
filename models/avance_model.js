const mongoose = require('mongoose');

const avanceSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: true,
        default: null
    },
    observacion: {
        type: String,
        required: false,
        default: null
        
    },
    valorNumerico: {
        type: Number,
        required: true 
    },
    ejercicio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ejercicio',
        required: false,
        default: null
    }
});


module.exports = mongoose.model('Avance', avanceSchema);