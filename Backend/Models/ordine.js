// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Ordine {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_ordine, username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento }) 
    {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO ordini (id_ordine, username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento) VALUES (?, ?, ?, ?, ?, ?)',
                [id_ordine, username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_ordine: id_ordine, username: username_ordinante, data_ora_ordinazione, ref_prenotazione, ref_cliente, ref_pagamento });
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti gli ordini
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM ordini', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM pagamenti WHERE id_pagamento = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async updatePagamento(id, idPagamento){
        return new Promise((resolve, reject) => {
            db.exec('UPDATE pagamenti SET importo = ? WHERE id_pagamento = ?', [id, idPagamento], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Ordine;