
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario_model');
const config = require('../config/development.json');

const autentificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(403).send({ message: 'No hay token en el encabezado' });
        }

        const decoded = jwt.verify(token, config.configToken.SEED);

        const usuario = await Usuario.findById(decoded.id); 

        if (!usuario) {
            console.log("Usuario no encontrado");
            return res.status(403).send({ message: 'Usuario no encontrado' }); 
        }

        if (!usuario.estado) {
            console.log("Usuario inactivo");
            return res.status(403).send({ message: 'Usuario inactivo' }); 
        }

        if (!usuario.administrador) {
            console.log("Usuario no es administrador");
            return res.status(403).send({ message: 'Usuario no es administrador' }); // Usuario no es administrador
        }

        // Adjuntar el usuario al request para uso posterior
        req.usuario = usuario;
       console.log("aut token de " + usuario);
        next();
    } catch (err) {
        console.error('Error verificando token:', err);
        return res.status(403).send({ message: 'Token no válido' });
    }
};



module.exports = autentificarToken;