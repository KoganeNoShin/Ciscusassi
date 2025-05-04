// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Pagamento {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_pagamento, importo, data_ora_pagamento }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO pagamenti (id_pagamento, importo, data_ora_pagamento) VALUES (?, ?, ?)',
                [id_pagamento, importo, data_ora_pagamento],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_pagamento: id_pagamento, importo: importo, data_ora_pagamento: data_ora_pagamento});
                }
            );
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

}

module.exports = Pagamento;