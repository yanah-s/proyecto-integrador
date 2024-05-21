const express = require('express');
const Usuario = require('../models/usuario_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();

const schema = Joi.object({
    nombre: Joi.string()
        .min(3)
        .max(10)
        .required(),

    password: Joi.string()
        .pattern(/^[a-zA-Z0-9]{3,30}$/),

    email: Joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
});


ruta.get('/', async (req, res) => {
    try {
        let usuarios = await listarUsuarios();
        res.json(usuarios)
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/', async (req, res) => {
    let body = req.body;

    const {error, value} = schema.validate({nombre: body.nombre, email: body.email 
        , password : body.password});
    if(!error){
        let resultado = crearUsuario(body);

        resultado.then( user => {
            res.json({
                valor: user
            })
        }).catch( err => {
            res.status(400).json({
                err
            })
        });
    }else{
        res.status(400).json({
            error
        })
    }    
});

ruta.put('/:email', (req, res) => {

    const {error, value} = schema.validate({nombre: req.body.nombre});

    if(!error){
        let resultado = actualizarUsuario(req.params.email, req.body);
        resultado.then(valor => {
            res.json({
                valor
            })
        }).catch(err => {
            res.status(400).json({
                err
            })
        });
    }else{
        res.status(400).json({
            error
        })
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
        administrador : body.administrador,
        objetivos : body.objetivos ,
        metas : body.metas,
        patologias : body.patologias,
        observaciones : body.observaciones,
        entrevistaPresencial : body.entrevistaPresencial
    });
    return await usuario.save();
}

async function listarUsuarios(){
    let usuarios = await Usuario.find();
    return usuarios;
}

async function listarUsuariosActivos(){
    let usuarios = await Usuario.find(({estado: true}));
    return usuarios;
}

async function actualizarUsuario(email, body){
    let usuario = await Usuario.findOneAndUpdate({"email": email}, {
        //COMO VAMOS A VALIDAR QUE EL USUARIO DEBE EDITAR CIERTO CAMPO 
        $set: {
            nombre: body.nombre,
            password: body.password
        }
    }, {new: true});
    return usuario;
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
module.exports = ruta;