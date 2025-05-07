// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Prenotazione {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_prenotazione, numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente }) 
    {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO prenotazioni (id_prenotazione, numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente) VALUES (?, ?, ?, ?, ?, ?)',
                [id_prenotazione, numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_prenotazione: id_prenotazione, numero_persona: numero_persone, otp: otp, data_ora_prenotazione: data_ora_prenotazione, ref_torretta: ref_torretta, ref_cliente: ref_cliente });
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutte le prenotazioni
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM prenotazioni', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prenotazioni WHERE id_prenotazione = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Prenotazione;