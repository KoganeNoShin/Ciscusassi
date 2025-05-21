"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Importiamo express per la libreria REST
const cors_1 = __importDefault(require("cors")); // Importiamo il modulo cors per gestire le richieste cross-origin
const routes_1 = __importDefault(require("./Routes/routes")); // Esponiamo le rotte contenute nel file routes le rotte come quelle 
// Avviamo l'app come un server express
const app = (0, express_1.default)();
// Impostiamo il server per rispondere in json
app.use(express_1.default.json());
// Or configure specific origins
app.use((0, cors_1.default)({
    origin: '*', // Your Angular app URL
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Importiamo tutte le rotte definite nel file routes
app.use('/', routes_1.default);
// Intercetta errori del server
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Errore interno del server' });
});
// Prendiamo la porta dal file .env oppure ne impostiamo una di default noi
const PORT = Number.parseInt(process.env.PORT) || 4200;
// Avviamo il server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`📡 Server in ascolto sulla porta ${PORT}`);
});
