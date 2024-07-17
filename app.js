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
const dbHost = 'localhost';
const dbPort = '27017'; 
const dbName = 'mi_base_de_datos'; 
var servidor = 'local';
if (dbHost != 'localhost'){
    servidor = 'aws';
} 
const dbURL = `mongodb://${dbHost}:${dbPort}/${dbName}`;

// Conectar a la base de datos
mongoose.connect(dbURL)
    .then(() => console.log('Conectado a la base de datos '+ servidor))
    .catch(err => console.error('Error al conectar a la base de datos:', err));

const app = express();
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Api RESTFul Ok, y ejecutándose en el puerto ${port}...`);
});


