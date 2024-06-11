const express = require('express');
const Disponibilidad = require('../models/disponibilidad_model');
const Joi = require('@hapi/joi');
const { default: mongoose } = require('mongoose');
const ruta = express.Router();

const DisponibilidadSchema = new mongoose.Schema({
    fecha: {
        type: Date,
        required: true
      },
    hora_desde:{
        type: String,
        required: true
    },
    hora_hasta:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Disponibilidad', DisponibilidadSchema);