const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    email: {
        type:String,
        required: true,
        unique : true
    },
    nombre: {
        type:String,
        required:true
    },
    password: {
        type:String,
        required: true
    },
    fNacimiento: {
        type:Date,
        required: true
    },
    estado: {
        type: Boolean,
        default: false
    },
    alumno: {
        type: Boolean,
        default: true
    },
    administrador: {
        type: Boolean,
        default: false       
    },
    objetivos : {
        type: String,
    }, 
    metas : {
        type: String,
    },
    patologias : {
        type: String,
    },
    observaciones : {
        type: String,
    }

});

module.exports = mongoose.model('Usuario', usuarioSchema);