const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const usuarios = require('./routes/usuarios');
const autentificacion = require ('./routes/autentificacion')
const logout = require ('./routes/logout')
const agendas = require('./routes/agendas');
const ejercicio = require('./routes/ejercicio');
const rutina = require('./routes/rutinas');
const notificaciones = require ('./routes/notificaciones');
const rutina_ej_alumno = require('./routes/rutina_ej_alumno');
const avances = require('./routes/avances');
const path = require('path');
const objetivo_meta = require('./routes/objetivo_meta');
const objetivo_meta_usuario = require('./routes/objetivo_meta_usuario');

const dbHost = 'localhost';
const dbPort = '27017'; 
const dbName = 'mi_base_de_datos'; 
var servidor = 'local';
if (dbHost != '127.0.0.1'){
    servidor = 'aws';
} 
const dbURL = `mongodb://${dbHost}:${dbPort}/${dbName}`;

// Conectar a la base de datos
mongoose.connect(dbURL)
    .then(() => console.log('Conectado a la base de datos '+ servidor))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));


app.use('/api/usuarios', usuarios);
app.use('/api/agenda', agendas);
app.use('/api/ejercicio', ejercicio);
app.use('/api/rutinas', rutina);
app.use('/api/notificaciones', notificaciones);
app.use('/api/autentificacion' ,autentificacion);
app.use('/api/logout',logout);
app.use('/api/rutina_ej_alumno', rutina_ej_alumno);
app.use('/api/avances', avances);
app.use('/api/objetivo_meta', objetivo_meta);
app.use('/api/objetivo_meta_usuario', objetivo_meta_usuario);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Api RESTFul Ok, y ejecutándose en el puerto ${port}...`);
});


