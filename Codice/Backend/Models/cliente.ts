// importo il db
import db from '../db';

// importo il modulo bcryptjs per la gestione delle password
import bcrypt from 'bcryptjs';

// Definiamo il modello del nostro utente
export interface ClienteData {
    nome: string;
    cognome: string;
    data_nascita: string;
    email: string;
    password: string;
    punti?: number;
    image: string;
}

export interface ClienteRecord extends ClienteData {
    numero_carta: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
class Cliente {

    // definisco il metodo per creare un nuovo utente
    static async create(data: ClienteData): Promise<ClienteRecord> {

        // Definiamo i campi come quelli presi dal data passato come parametro
        const { nome, cognome, data_nascita, email, password, punti, image } = data;

        // genSalt genera un seed casuale per l'hashing della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO clienti (nome, cognome, data_nascita, email, password, punti, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nome, cognome, data_nascita, email, hashedPassword, punti, image],
                function (err: Error) {
                    if (err) return reject(err);
                    resolve({ ...data, password: hashedPassword });
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti i clienti
    static async findAll(): Promise<ClienteRecord[]> {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM clienti', (err: Error | null, rows: ClienteRecord[]) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    // definisco il metodo per trovare un utente in base all'username
    static async findByEmail(email: string): Promise<ClienteRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM clienti WHERE email = ?', [email], (err: Error | null, row: ClienteRecord) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per numero_carta
    static async findByNumeroCarta(numero_carta: string): Promise<ClienteRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM clienti WHERE numero_carta = ?', [numero_carta], (err: Error, row: ClienteRecord) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }


    // confronta la password inserita con quella salvata nel db
    static async comparePassword(candidatePassword: string, hash: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, hash);
    }

    static async login(email: string, password: string) {
        const user = await this.findByEmail(email);

        if (!user) // Se l'utente non esiste ritorna falso
            return false;

        // Se la password è corretta ritorna vero
        return this.comparePassword(password, user.password);
    }

}

export default Cliente;