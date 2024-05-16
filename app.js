// const usuarios = require('./routes/usuarios');
// const express = require('express');
// const mongoose = require('mongoose');

// //Conectarnos a la BD LOCAL
// mongoose.connect('mongodb://localhost:27017/proyectoIntegrador', {useNewUrlParser: true, useUnifiedTopology: true})
//     .then(() => console.log('Conectado a MongoDB LOCAL!'))
//     .catch(err => console.log('No se pudo conectar con MongoDB..', err));


// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({extended:true}));
// app.use('/api/usuarios', usuarios);

// const port = process.env.PORT || 3000;
// app.listen(port, () => {
//     console.log('Api Ok...');
// })


///////////ori hasta aca 


const usuarios = require('./routes/usuarios');
const express = require('express');
const mongoose = require('mongoose');


// Configuración de la URL de conexión a la base de datos
const dbHost = '3.16.90.77';
//'3.16.90.77'; 
const dbPort = '27017'; 
const dbName = 'mi_base_de_datos'; 
var servidor = 'local';
if (dbHost != 'localhost'){
    servidor = 'aws';
} 
const dbURL = `mongodb://${dbHost}:${dbPort}/${dbName}`;

// Conectar a la base de datos
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a la base de datos '+ servidor))
    .catch(err => console.error('Error al conectar a la base de datos:', err));


const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use('/api/usuarios', usuarios);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Api RESTFul Ok, y ejecutándose...');
})

