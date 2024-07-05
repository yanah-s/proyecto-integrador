const mongoose = require('mongoose');

const ejercicioSchema = new mongoose.Schema({
    nombre: {
        type:String,
        required:true
    },
    categoria: {
        type:String,
        required: true
    },
    musculoPpal: {
        type:String,
        required: true
    },
    otrosMusculos: {
        type: [String]
    },
    descripcion: {
        type: String
    },
    video: {
        type: String,
    },
    disponible: {
        type: Boolean,
        default: true
    }
}, {
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v; // Elimina el campo __v
            return ret;
        }
    }
});

module.exports = mongoose.model('ejercicio', ejercicioSchema);