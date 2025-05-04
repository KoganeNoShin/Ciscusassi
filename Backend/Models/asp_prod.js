// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class AspProd {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_asp_prod, ref_asporto, ref_prodotto }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO asp_prod (id_asp_prod, ref_asporto, ref_prodotto) VALUES (?, ?, ?)',
                [id_asp_prod, ref_asporto, ref_prodotto],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_asp_prod: id_asp_prod, ref_asporto: ref_asporto, ref_prodotto: ref_prodotto });
                }
            );
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM asp_prod WHERE id_asp_prod = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = AspProd;