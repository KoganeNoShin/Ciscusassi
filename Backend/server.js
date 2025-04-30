const express = require('express');
const db = require('./db');

const app = express();
// const authRoutes = require('./src/auth/routes/authRoutes');

// Middleware che permette di ritornare json
app.use(express.json());

// Routes definite nel file routes
//app.use('/api/auth', authRoutes);

const cors = require('cors'); // Importiamo il modulo cors per gestire le richieste cross-origin
app.use(cors());

// Or configure specific origins
app.use(cors({
    origin: 'http://localhost:4200', // Your Angular app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Intercetta errori del server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
});

// Avvio server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta ${PORT}`);
});