// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class OrdProd {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_ord_prod, is_romana, stato, ref_prodotto, ref_ordine }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO ord_prod (id_ord_prod, is_romana, stato, ref_prodotto, ref_ordine) VALUES (?, ?, ?, ?, ?)',
                [id_ord_prod, is_romana, stato, ref_prodotto, ref_ordine],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_ord_prod: id_ord_prod, is_roman: is_romana, stato: stato, ref_prodotto: ref_prodotto, ref_ordine: ref_ordine });
                }
            );
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM ord_prod WHERE id_ord_prod = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }
    
    static async findByRefOrdine(ref_ordine){
        return new Promise((resolve,reject) => {
            db.all('SELECT * FROM ord_prod WHERE ref_ordine = ?', [ref_ordine], (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

}

module.exports = OrdProd;