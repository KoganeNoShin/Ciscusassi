// importo il db
const db = require('../db');

// importo il modulo bcryptjs per la gestione delle password
const bcrypt = require('bcryptjs');

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Cliente {
  
    // definisco il metodo per creare un nuovo utente
    static async create({ numero_carta, nome, cognome, data_nascita, email, password, punti, image }) 
    {
        // genSalt genera un seed casuale per l'hashing della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO clienti (numero_carta, nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [numero_carta, nome, cognome, data_nascita, email, hashedPassword, punti, image],
                function(err) {
                    if (err) reject(err);
                    resolve({ id: numero_carta, nome: nome, cognome: cognome, data_nascita:data_nascita, email: email, password: hashedPassword, punti: punti, image: image});
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti i clienti
    static async findAll(){
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM clienti', (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // definisco il metodo per trovare un utente in base all'username
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM clienti WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per numero_carta
    static async findByNumeroCarta(numero_carta) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM clienti WHERE numero_carta = ?', [numero_carta], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }


    // confronta la password inserita con quella salvata nel db
    static async comparePassword(candidatePassword, hash) {
        return bcrypt.compare(candidatePassword, hash);
    }

    static async login(email, password){
        return new Promise ((resolve, reject) => {
            this.findByEmail(email).then((res) => {
            resolve(res);
        }).catch((err) => {
            reject(err);
        });
    });}

}

module.exports = Cliente;