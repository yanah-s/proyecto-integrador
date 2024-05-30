const mongoose = require('mongoose');
const bcryptjs = require ('bcryptjs');

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
        default: true
    },
    alumno: {
        type: Boolean,
        default: false
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
    },
    entrevistaPresencial : {
        type: Boolean,
        defauls : false
    }

});

usuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
});

// Método para comparar la contraseña ingresada con la cifrada
usuarioSchema.methods.compararPassword = function (passwordIngresado) {
    return bcryptjs.compare(passwordIngresado, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);