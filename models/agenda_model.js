const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

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
      id_usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario',
        unique : true,
        default: null
      },
      observacion:{
        type: String
      },
      presencial : {
        type: Boolean,
        defauls : false
      }
});

//agendaSchema.index({ fecha: 1, hora_desde: 1, hora_hasta: 1 }, { unique: true });

module.exports = mongoose.model('Agenda', agendaSchema);