import express, { Request, Response, NextFunction } from 'express'; // Importiamo express per la libreria REST

import cors from 'cors'; // Importiamo il modulo cors per gestire le richieste cross-origin

import rotte from './Routes/routes'; // Esponiamo le rotte contenute nel file routes le rotte come quelle 

// Avviamo l'app come un server express
const app = express();

// Impostiamo il server per rispondere in json
app.use(express.json());

// Or configure specific origins
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8100',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Importiamo tutte le rotte definite nel file routes
app.use('/', rotte);

// Intercetta errori del server
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
});

// Prendiamo la porta dal file .env oppure ne impostiamo una di default noi
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4200;

// Avviamo il server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Server in ascolto sulla porta ${PORT}`);
});