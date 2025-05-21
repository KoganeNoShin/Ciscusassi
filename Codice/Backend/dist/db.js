"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import del modulo sqlite3
const sqlite3_1 = __importDefault(require("sqlite3"));
// creazione del database e della tabella clienti
const db = new sqlite3_1.default.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('❌ Errore connessione al database:', err.message);
        return;
    }
    console.log('🛜  Connesso al database SQLite');
});
exports.default = db;
