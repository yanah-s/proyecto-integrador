const mongoose = require('mongoose');
const Joi = require('@hapi/joi');

const motivacionalSchema = new mongoose.Schema({
    titulo: {
        type: String,
        defaul : "",
      },
      mensaje: {
        type: String,
          defaul : "",
      },
      categoria : {
        type :String,
        require :true
      },
});

module.exports = mongoose.model('Motivacional', motivacionalSchema);