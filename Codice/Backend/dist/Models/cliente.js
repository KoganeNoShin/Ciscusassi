"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// importo il db
const db_1 = __importDefault(require("../db"));
// importo il modulo bcryptjs per la gestione delle password
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Cliente {
    // definisco il metodo per creare un nuovo utente
    static async create(data) {
        // Definiamo i campi come quelli presi dal data passato come parametro
        const { nome, cognome, data_nascita, email, password, punti, image } = data;
        // genSalt genera un seed casuale per l'hashing della password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        return new Promise((resolve, reject) => {
            db_1.default.run('INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [nome, cognome, data_nascita, email, hashedPassword, punti, image], function (err) {
                if (err)
                    return reject(err);
                resolve({ ...data, password: hashedPassword });
            });
        });
    }
    // definiamo il metodo per ritornare tutti i clienti
    static async findAll() {
        return new Promise((resolve, reject) => {
            db_1.default.all('SELECT * FROM clienti', (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    // definisco il metodo per trovare un utente in base all'username
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            db_1.default.get('SELECT * FROM clienti WHERE email = ?', [email], (err, row) => {
                if (err)
                    reject(err);
                resolve(row);
            });
        });
    }
    // ricerca per numero_carta
    static async findByNumeroCarta(numero_carta) {
        return new Promise((resolve, reject) => {
            db_1.default.get('SELECT * FROM clienti WHERE numero_carta = ?', [numero_carta], (err, row) => {
                if (err)
                    reject(err);
                resolve(row);
            });
        });
    }
    // confronta la password inserita con quella salvata nel db
    static async comparePassword(candidatePassword, hash) {
        return bcryptjs_1.default.compare(candidatePassword, hash);
    }
    static async login(email, password) {
        const user = await this.findByEmail(email);
        if (!user) // Se l'utente non esiste ritorna falso
            return false;
        // Se la password è corretta ritorna vero
        return this.comparePassword(password, user.password);
    }
}
exports.default = Cliente;
