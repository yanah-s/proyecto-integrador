const express = require('express');
const Usuario = require('../models/usuario_model');
const Joi = require('@hapi/joi');
const ruta = express.Router();
const mongoose = require('mongoose');
const autentificarToken = require ('../middleware/autToken');
const autTokenNotAdmin = require('../middleware/autTokenNotAdmin')
const emailjs = require('@emailjs/nodejs')

ruta.post('/recuperar-passw', async (req, res) => {
    const destinatario = req.body.email;
    if (!destinatario) {
        return res.status(400).json({ error: 'Se requiere el correo del destinatario' });
    }

    try {
        const codigoRecuperacion = generarCodigoRecuperacion();  // Función para generar un código aleatorio
        emailjs.init({
            publicKey: "7--swjL0vAAZOenXV",
            privateKey: "3pK0dNgGjam0d4V4FfYym",
            });
        
            const templateParams = {
                destinatario: destinatario,
                codigo: codigoRecuperacion
            };
        
            emailjs.send('service_zxoqdx3', 'template_1grdk19', templateParams).then(
                (response) => {
                    console.log('SUCCESS!', response.status, response.text);
                    setearCodigoRecuperacion(destinatario,codigoRecuperacion );

                    res.status(200).json({ mensaje: 'Correo enviado correctamente' });
                },
                (err) => {
                    console.log('FAILED...', err);
                    res.status(500).json({ error: 'Hubo un error al enviar el correo' });
                },
            );
       
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

// const validadEdad = (fechaIngresada) => {
//     const actual = new Date();
//     const fecha = new Date(fechaIngresada);
//     const edad = actual.getFullYear() - fecha.getFullYear();
//     const meses = actual.getMonth() - fecha.getMonth();

//     // Ajusta la edad si el mes de nacimiento no ha ocurrido aún 
//     if (meses < 0 || (meses === 0 && actual.getDate() < fecha.getDate())) {
//         age--;
//     }

//     // Verifica si la edad está entre 16 y 50 años
//     return age >= 16 && age <= 50;
// };

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
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', '.com'] } })
        .required()
        .messages({
            'string.email': 'El correo electrónico debe ser un correo válido.',
            'any.required': 'El correo electrónico es un campo obligatorio.'
        }),
        patologias: Joi.string().allow('') ,


        telefono: Joi.string()
        .required()
        .messages({
            'any.required': 'El telefono es un campo obligatorio.'
        })
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
        'date.format': 'El formato de la fecha de nacimiento es inválido.',
        'date.max': 'Debes tener al menos 16 años de edad.',
        'date.min': 'No debes tener más de 50 años de edad.',
        'any.required': 'La fecha de nacimiento es un campo obligatorio.', 
         'any': 'Error en el campo de fecha de nacimiento.'
      });
  };


ruta.get('/',autentificarToken, async (req, res) => {
    try {
        
        let usuarios = await listarUsuariosActivos();
        res.json(usuarios);
    } catch (err) {
        res.status(400).json({ err });
    }
});

ruta.post('/', async (req, res) => {
    try {
      const { error, value } = schema.validate(req.body, { abortEarly: false });
      console.log(error);
      if (error) {
        const errorMessages = error.details.map(err => err.message);
        return res.status(400).json({ errors: errorMessages });
      }
      const user = await crearUsuario(req.body);
        res.json({ value: user });
        console.log("este es el usuario creado recien"+ user._id);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error interno' });
    }
  });

ruta.put('/:email',autentificarToken, (req, res) => {
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


ruta.get('/:id', (req, res) => {
    try{
     let resultado = buscarUsuarioPorId(req.params.id);
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

 async function buscarUsuarioPorId(id){
    let user = await Usuario.findById(id);
    return user;
}


ruta.put('/editarUsuario/:id', (req, res) => {

  console.log("llega al editar");
    try{
     let resultado = editarUsuario (req.params.id, req.body);
     resultado.then(valor => {
         res.json({
             valor
         });
     }).catch(err => {
        console.log("error primer catch");
         res.status(400).json({
             error: 'Error al actualizar usuario'
         });
     });
    }catch{
        console.log("error 2 catch");
     res.status(400).json({
         error: 'Datos inválidos'
     });
    }
       
 });

 ruta.put('/editar/:id', (req, res) => {

    console.log("llega al editar");
      try{
       let resultado = editarUsuarioNoAdmin (req.params.id, req.body);
       resultado.then(valor => {
           res.json({
               valor
           });
       }).catch(err => {
          console.log("error primer catch");
           res.status(400).json({
               error: 'Error al actualizar usuario'
           });
       });
      }catch{
          console.log("error 2 catch");
       res.status(400).json({
           error: 'Datos inválidos'
       });
      }
         
   });

   async function editarUsuarioNoAdmin (id, body){
    console.log(id);
    try {
        let usuario = await Usuario.findOne({ "_id": id });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        
        else {
            console.log("cambiando passw");
            if(body.password != "" || body.password != usuario.password){
                usuario.password =body.password;
            }
            if(body.telefono != "" || body.telefono != usuario.telefono){
                usuario.telefono = body.telefono;
            }

            
            await usuario.save();
            console.log(usuario);
        }
       
        return usuario;
    } catch (err) {
        throw new Error('Error al actualizar el usuario: ' + err.message);
    }
}
 

 ruta.put('/asignar/:id',autentificarToken, (req, res) => {
    try{
     let resultado = activarAlumno (req.params.id, req.body);
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



ruta.delete('/:id', autentificarToken , (req, res) => {
    console.log("desactiva usuario" + req.params.id);

    console.log("ES ADMIN" + req.isAdmin);
    let resultado = desactivarUsuario(req.params.id);
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
        patologias : body.patologias,
        telefono : body.telefono

    });
    return await usuario.save();
}

async function listarUsuarios(){
    let usuarios = await Usuario.find();
    return usuarios;
}

async function listarUsuariosActivos(){
    let usuarios = await Usuario.
    find(({estado: true, administrador: false}));
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

async function editarUsuario (id, body){
    console.log(id);
    try {
        let usuario = await Usuario.findOne({ "_id": id });

        if (!usuario) {
            throw new Error('Usuario no encontrado');
        }
        
        else {
            console.log(usuario);
            if(body.patologias !== ""){
                usuario.patologias =body.patologias;
            }else if(body.observaciones !== "") {
                usuario.observaciones = body.observaciones;
            } 
            
            await usuario.save();
            console.log(usuario);
        }
       
        return usuario;
    } catch (err) {
        throw new Error('Error al actualizar el usuario: ' + err.message);
    }
}

async function desactivarUsuario(id){
    console.log(id);
    
    let usuario = await Usuario.findOneAndUpdate({"_id": id}, {
        $set: {
            estado: false
        }
    }, {new: true});
    console.log(usuario);
    return usuario;
}


async function activarAlumno (id){
    let usuario = await Usuario.findOneAndUpdate({"_id": id}, {
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