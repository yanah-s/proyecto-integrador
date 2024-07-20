const mongoose = require('mongoose');


const avanceSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
    },
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false,
        default: null
    },
    observacion: {
        type: String
    },
    valorNumerico: {
        type: Number,
        required: false,
        default: null
    }
});

module.exports = mongoose.model('Avance', avanceSchema);