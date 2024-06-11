const express = require('express');
const Agenda = require('../models/agenda_model');
const Joi = require('@hapi/joi');
const { default: mongoose } = require('mongoose');
const ruta = express.Router();

const AgendaSchema = new mongoose.Schema({
    fecha: {
      type: Date,
      required: true
    },
    id_usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
      unique : true
    },
    observacion:{
      type: String
    },
    presencial : {
      type: Boolean,
      defauls : false
    }
});

module.exports = mongoose.model('Agenda', AgendaSchema);