// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Torretta {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_torretta, ref_filiale }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO torrette (id_torretta, ref_filiale) VALUES (?, ?)',
                [id_torretta, ref_filiale],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: id_torretta, ref_filiale: ref_filiale});
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutte le torrette
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM torrette', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }
    
    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM torrette WHERE id_torretta = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Torretta;