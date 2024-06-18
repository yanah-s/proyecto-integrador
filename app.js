const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const usuarios = require('./routes/usuarios');
const agenda = require ('./routes/agendas');

const dbHost = '127.0.0.1';
//'3.16.90.77'; 
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
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended:true}));
app.use('/api/usuarios', usuarios);
app.use('/api/agenda', agenda);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Api RESTFul Ok, y ejecutándose en el puerto ${port}...`);
});

