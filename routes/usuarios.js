const express = require('express');
const Usuario = require('../models/usuario_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

    // Configurar el transporter 
    const transporter = nodemailer.createTransport({
        host: "smtp.office365.com",
        port: "587",
        service: 'hotmail',
        auth: {
            user: 'avance.fit@hotmail.com',  // Correo que envia el codigo
            pass: 'avance2024'  // Contraseña de correo 
        }
    });

ruta.post('/recuperar-passw', async (req, res) => {

    const destinatario = req.body.email;
    if (!destinatario) {
        return res.status(400).json({ error: 'Se requiere el correo del destinatario' });
    }
    const { auth: { user } } = transporter.options;
    try {
        const codigoRecuperacion = generarCodigoRecuperacion();  // Función para generar un código aleatorio
        
         //Enviar el correo
         await transporter.sendMail({
             from: user,
             to: destinatario,
             subject: 'Código de recuperación de contraseña',
             text: `Tu código de recuperación de contraseña es: ${codigoRecuperacion}. 
             Puedes cambiar tu contraseña siguiendo este enlace: http://localhost:5000`,
           
            });
      
        setearCodigoRecuperacion(destinatario,codigoRecuperacion );

         res.status(200).json({ mensaje: 'Correo enviado correctamente' });
    } catch (error) {
         console.error('Error al enviar el correo:', error);
         res.status(500).json({ error: 'Hubo un error al enviar el correo' });
    }
});

async function setearCodigoRecuperacion(email, codigoRecuperacion) {
    const usuario = await Usuario.findOneAndUpdate(
        { email: email },
        { codigoRecuperacion: codigoRecuperacion },
        { new: true } 
    );

}

function generarCodigoRecuperacion() {

    return  Math.random().toString(36).slice(2, 8).toUpperCase();  
}

const validadEdad = (fechaIngresada) => {
    const actual = new Date();
    const fecha = new Date(fechaIngresada);
    const edad = actual.getFullYear() - fecha.getFullYear();
    const meses = actual.getMonth() - fecha.getMonth();

    // Ajusta la edad si el mes de nacimiento no ha ocurrido aún 
    if (meses < 0 || (meses === 0 && actual.getDate() < fecha.getDate())) {
        age--;
    }

    // Verifica si la edad está entre 16 y 50 años
    return age >= 16 && age <= 50;
};

const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .required()
        .messages({
            'string.min': 'El nombre debe tener al menos 3 caracteres.',
            'any.required': 'El nombre es un campo obligatorio.'
        }),

    password: Joi.string()
        .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{5,}$/)
        .required()
        .messages({
            'string.pattern.base': 'La contraseña debe tener al menos 5 caracteres, incluyendo al menos una letra y un número.',
            'any.required': 'La contraseña es un campo obligatorio.'
        }),
        password2: Joi.ref('password'), 
        fNacimiento: fechaNacimiento(),
    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
        .required()
        .messages({
            'string.email': 'El correo electrónico debe ser un correo válido.',
            'any.required': 'El correo electrónico es un campo obligatorio.'
        }),
});

//verifica edad de los usuairos
  function fechaNacimiento() {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 16);
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 50);
  
    return Joi.date()
      .max(maxDate.toISOString())
      .iso()
      .min(minDate.toISOString())
      .required()
      .messages({
        'date.base': 'La fecha de nacimiento debe ser una fecha válida.',
        'date.max': 'Debes tener al menos 16 años de edad.',
        'date.min': 'No debes tener más de 50 años de edad.',
        'any.required': 'La fecha de nacimiento es un campo obligatorio.'
      });
  }

ruta.get('/', async (req, res) => {
    try {
        let usuarios = await listarUsuarios();
        res.json(usuarios)
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/', async (req, res) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
      }
  
      const user = await crearUsuario(req.body);
  
      res.json({ valor: user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error interno' });
    }
  });

ruta.put('/:email', (req, res) => {
   try{
    let resultado = actualizarPassword(req.params.email, req.body);
    resultado.then(valor => {
        res.json({
            valor
        });
    }).catch(err => {
        res.status(400).json({
            error: 'Error al actualizar usuario'
        });
    });
   }catch{
    res.status(400).json({
        error: 'Datos inválidos'
    });
   }
      
});

ruta.delete('/:email', (req, res) => {
    let resultado = desactivarUsuario(req.params.email);
    resultado.then(valor => {
        res.json({
            usuario: valor
        })
    }).catch(err => {
        res.status(400).json({
            err
        })
    });
});

async function crearUsuario(body){
    let usuario = new Usuario({
        email       : body.email,
        nombre      : body.nombre,
        password    : body.password,
        fNacimiento : body.fNacimiento,
        estado : body.estado,
        alumno : body.alumno,
        administrador : body.administrador

    });
    return await usuario.save();
}

async function listarUsuarios(){
    let usuarios = await Usuario.find();
    return usuarios;
}

async function listarUsuariosActivos(){
    let usuarios = await Usuario.
    
    
    find(({estado: true}));
    return usuarios;
}

async function actualizarPassword(email, body){
    try {
        let usuario = await Usuario.findOne({ email: email });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }

        if (body.password) {
            usuario.codigoRecuperacion ="";
            usuario.password = body.password;
        }

        if (body.alumno !== undefined) {
            usuario.alumno = body.alumno;
        }

        await usuario.save();

        return usuario;
    } catch (err) {
        throw new Error('Error al actualizar el usuario: ' + err.message);
    }
}

async function desactivarUsuario(email){
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            estado: false
        }
    }, {new: true});
    return usuario;
}


async function activarAlumno (email){
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        $set: {
            alumno: true
        }
    }, {new: true});
    return usuario;
}


const usuarioSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

usuarioSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
    }
    next();
});
usuarioSchema.methods.compararPassword = async function (passwordIngresado) {
   
    return bcryptjs.compare(passwordIngresado, this.password);
};



module.exports = ruta;