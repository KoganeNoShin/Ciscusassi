// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Filiale {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_filiale, comune, indirizzo, num_tavoli, immagine }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO filiali (id_filiale, comune, indirizzo, num_tavoli, immagine) VALUES (?, ?, ?, ?, ?)',
                [id_filiale, comune, indirizzo, num_tavoli, immagine],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: id_filiale, comune: comune, indirizzo: indirizzo, num_tavoli: num_tavoli, immagine: immagine});
                }
            );
        });
    }

    static async findAll() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM filiali', (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM filiali WHERE id_filiale = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Filiale;