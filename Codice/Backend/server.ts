import express from 'express'; // Importiamo express per la libreria REST
import db from './db'; // Importiamo il file db per la connessione con il DBMS

import cors from 'cors'; // Importiamo il modulo cors per gestire le richieste cross-origin

const app = express(); // Avviamo l'app come un server express
const rotte = require('./Routes/routes'); // Esponiamo le rotte contenute nel file routes le rotte come quelle 

// Middleware che permette di ritornare json
app.use(express.json());

// Routes definite nel file routes
app.use('/', rotte);

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