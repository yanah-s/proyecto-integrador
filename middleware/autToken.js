// const jwt = require('jsonwebtoken');
// const Usuario = require('../models/usuario_model');
// const config = require('../config/development.json');

// const autToken = async (req, res, next) => {
//     try {
       
//         const authHeader = req.headers['authorization'];
//         const token = authHeader && authHeader.split(' ')[1];

//         if (!token) {
//             return res.sendStatus(401); // No hay token en el encabezado
//         }

//         const decoded = jwt.verify(token, config.configToken.SEED);

//         const usuario = await Usuario.findOne({ _id: decoded.id });
//         if (!usuario) {
//             console.log("no encuentra usuario");
//             return res.sendStatus(403); // Token no válido o usuario no encontrado
//         }

//         if (usuario.token !== token) {
//             console.log("no encuentra token");
//             return res.sendStatus(403);
//         }
//         if (!usuario.estado) {
//             console.log("no encuentra estado");
//             return res.sendStatus(403); // Usuario no está activo
//         }

//         req.isAdmin = usuario.administrador === true; // Marcar como administrador
//         console.log("Verificando token llegaaaaa" + token);
//         next();
//     } catch (err) {
//         console.error('Error verificando token:', err);
//         return res.sendStatus(403);
//     }
// };



// module.exports = autToken;


const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario_model');
const config = require('../config/development.json');

const autentificarToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).send({ message: 'No hay token en el encabezado' });
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
       
        next();
    } catch (err) {
        console.error('Error verificando token:', err);
        return res.status(403).send({ message: 'Token no válido' });
    }
};
module.exports = autentificarToken;