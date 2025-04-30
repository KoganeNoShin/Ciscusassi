//import del modulo sqlite3
const sqlite3 = require('sqlite3').verbose();

//creazione del database e della tabella clienti
const db = new sqlite3.Database('../database.sqlite', (err) => {
    if (err) {
        console.error('Errore connessione al database:', err.message);
        return;
    }

    console.log('☑️ Connesso al database SQLite');
    
    
});

module.exports = db;