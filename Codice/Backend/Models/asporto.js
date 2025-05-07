// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Asporto {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_asporto, indirizzo, data_ora_consegna, ref_cliente }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO asporti (id_asporto, indirizzo, data_ora_consegna, ref_cliente) VALUES (?, ?, ?, ?)',
                [id_asporto, indirizzo, data_ora_consegna, ref_cliente],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_asporto: id_asporto, indirizzo: indirizzo, data_ora_consegna: data_ora_consegna, ref_cliente: ref_cliente});
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti gli asporti
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM asporti', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM asporti WHERE id_asporto = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Asporto;