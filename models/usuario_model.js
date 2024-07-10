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

    codigoRecuperacion: {
        type: String,
        default: ""      
    },
    token: {
        type: String,
        default:""
    },
    patologias: {
        type: String,
         default:""
    },
    observaciones: {
        type: String,
         default:""
    },
    notificacionesUsuario: [
        {
            message: { type: String },
            read: { type: Boolean, default: false },
            timestamp: { type: Date, default: Date.now }
        }
    ]
});


usuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
});

usuarioSchema.methods.compararPassword = function (passwordIngresado) {
    return bcryptjs.compare(passwordIngresado, this.password);
};
usuarioSchema.methods.compararCodigo = function (codigoIngresado) {
    return bcryptjs.compare(codigoIngresado, this.codigoRecuperacion);
};

module.exports = mongoose.model('Usuario', usuarioSchema);