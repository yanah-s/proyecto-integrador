const mongoose = require('mongoose');
const Joi = require('@hapi/joi');
//const Usuario = require('./usuario_model');

const agendaSchema = new mongoose.Schema({
     fecha: {
        type: Date,
        required: true
      },
      hora_desde: {
        type: Date,
        required: true
      },
      hora_hasta: {
        type: Date,
        required: true
      },
      usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        required: false,
        default : null
      },
      observacion:{
        type: String,
        default : ""
      },
      presencial : {
        type: Boolean,
        default : false
      }
});

//agendaSchema.index({ fecha: 1, hora_desde: 1, hora_hasta: 1 }, { unique: true });

module.exports = mongoose.model('Agenda', agendaSchema);