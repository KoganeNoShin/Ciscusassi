// importo il db
const db = require('../db');

// importo il modulo bcryptjs per la gestione delle password
const bcrypt = require('bcryptjs');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Impiegato {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ matricola, nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale}) 
    {

        // genSalt genera un seed casuale per l'hashing della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO impiegati (matricola, nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [matricola, nome, cognome, ruolo, foto, email, data_nascita, hashedPassword, ref_filiale],
                function(err) {
                    if (err) reject(err);
                    resolve({ matricola: matricola, nome: nome, cognome: cognome, ruolo: ruolo, foto: foto, email: email, data_nascita: data_nascita, password: hashedPassword, ref_filiale: ref_filiale});
                }
            );
        });
    }

    // ricerca per id
    static async findByMatricola(matricola) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM impiegati WHERE matricola = ?', [matricola], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // confronta la password inserita con quella salvata nel db
    static async comparePassword(candidatePassword, hash) {
        return bcrypt.compare(candidatePassword, hash);
    }

}

module.exports = Impiegato;