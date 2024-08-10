const mongoose = require('mongoose');

const objetivo_meta_usuarioSchema = new mongoose.Schema({
    objetivoMeta: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'objetivoMeta', 
        required: true 
    },
    usuario: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario', 
        required: true 
    },
    fechaDesde: { 
        type: Date,     
        required: true 
    },
    fechaHasta: { 
        type: Date, 
        required: true 
    },
    valor: { 
        type: Number
    },
    creadoAdmin: { 
        type: Boolean, 
        default: false
    },
    cumplido: { 
        type: Boolean, 
        default: false
    }
});
  
module.exports = mongoose.model('objetivo_meta_usuario', objetivo_meta_usuarioSchema);