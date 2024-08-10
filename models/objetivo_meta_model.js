const mongoose = require('mongoose');

const objetivo_metaSchema = new mongoose.Schema({
    nombre: {
        type:String,
        required:true
    }
});

module.exports = mongoose.model('objetivoMeta', objetivo_metaSchema);