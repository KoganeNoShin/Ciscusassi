// importo il db
import db from '../db';

// importo il modulo bcryptjs per la gestione delle password
import bcrypt from 'bcryptjs';

// Definiamo il modello dell'impiegatp
export interface ImpiegatoInput{
    nome: string,
    cognome: string,
    ruolo: string,
    foto: string,
    email: string,
    data_nascita: string,
    password: string,
    ref_filiale: number
}

export interface ImpiegatoRecord extends ImpiegatoInput {
    matricola: number,
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Impiegato {
  
    // definisco il metodo per creare un nuovo utente
    static async create(data: ImpiegatoInput) 
    {

        const { nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale } = data;
 
        // genSalt genera un seed casuale per l'hashing della password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO impiegati (nome, cognome, ruolo, foto, email, data_nascita, password, ref_filiale) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [nome, cognome, ruolo, foto, email, data_nascita, hashedPassword, ref_filiale],
                function(err) {
                    if (err) reject(err);
                    resolve({ nome: nome, cognome: cognome, ruolo: ruolo, foto: foto, email: email, data_nascita: data_nascita, password: hashedPassword, ref_filiale: ref_filiale});
                }
            );
        });
    }

    // ricerca per id
    static async findByMatricola(matricola: string) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM impiegati WHERE matricola = ?', [matricola], (err: Error | null, row: ImpiegatoRecord) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // confronta la password inserita con quella salvata nel db
    static async comparePassword(candidatePassword: string, hash: string) {
        return bcrypt.compare(candidatePassword, hash);
    }

}

export default Impiegato;