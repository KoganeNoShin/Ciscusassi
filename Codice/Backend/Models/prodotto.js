// importo il db
const db = require('../db');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Prodotto {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ id_prodotto, nome, descrizione, costo, immagine, categoria, is_piatto_giorno }) 
    {

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO prodotti (id_prodotto, nome, descrizione, costo, immagine, categoria, is_piatto_giorno) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [id_prodotto, nome, descrizione, costo, immagine, categoria, is_piatto_giorno],
                function(err) {
                    if (err) reject(err);
                    resolve({ id_prodotto: id_prodotto, nome: nome, descrizione: descrizione, costo: costo, immagine: immagine, categoria: categoria, is_piatto_giorno: is_piatto_giorno});
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti i prodotti
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM prodotti', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getPiattoDelGiorno(){
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prodotti WHERE is_piatto_giorno = 1', (err, row) => {
                if (err) reject(err);
                resolve(row);
            }); 
        });
    }
    
    // ricerca per id
    static async findById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prodotti WHERE id_prodotto = ?', [id], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}

module.exports = Prodotto;