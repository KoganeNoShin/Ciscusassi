const express = require('express');
const db = require('./db');

const { faker } = require('@faker-js/faker');

const app = express();
// const authRoutes = require('./src/auth/routes/authRoutes');

// Middleware che permette di ritornare json
app.use(express.json());

// Routes definite nel file routes
//app.use('/api/auth', authRoutes);

const cors = require('cors'); // Importiamo il modulo cors per gestire le richieste cross-origin
const Filiale = require('./Models/filiale');
const Prodotto = require('./Models/prodotto');
const Cliente = require('./Models/cliente');

// Or configure specific origins
app.use(cors({
    origin: '*', // Your Angular app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Intercetta errori del server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
});

// Avvio server
const PORT = process.env.PORT || 4200;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Server in ascolto sulla porta ${PORT}`);
});

// Query

app.get('/', (req, res) =>{
    res.send("👋🏽  Il server funziona!");
});

app.post('/login', (req, res) =>{
    Cliente.login("Darrick.Prosacco@yahoo.com", "asd").then((data)=>{
        res.json(data);
    }).catch((err)=>{
        return err;
    });
});

app.get('/prodotti', (req, res) =>{
    Prodotto.findAll().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        return err;
    })
});

app.get('/PiattoDelGiorno', (req, res) =>{
    Prodotto.getPiattoDelGiorno().then((data)=>{
        res.json(data);
    }).catch((err)=>{
        return err;
    });
});

app.get('/Filiali', (req, res) =>{
    Filiale.findAll().then((data)=>{
        res.json(data);
    }).catch((err) => {
        return err;
    });
});

app.get('/otp', (req, res) => {
    res.json(faker.number.int(({ min: 10000, max: 99999 })));
});