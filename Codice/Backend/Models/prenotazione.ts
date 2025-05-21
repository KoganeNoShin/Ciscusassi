// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';
import { AsportoRecord } from './asporto';

// Definiamo il modello di un Pagamento
export interface PrenotazioneInput {
    numero_persone: number;
    otp: string;
    data_ora_prenotazione: string;
    ref_torretta: number;
    ref_cliente: number;
}
export interface PrenotazioneRecord extends PrenotazioneInput {
    id_prenotazione: number; 
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Prenotazione {
  
    // definisco il metodo per creare un nuovo utente
    static async create(data: PrenotazioneInput) : Promise<number>{ 

        const { numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente } = data;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO prenotazioni (numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente) VALUES (?, ?, ?, ?, ?)',
                [numero_persone, otp, data_ora_prenotazione, ref_torretta, ref_cliente],
                function(this: RunResult, err: Error | null) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutte le prenotazioni
    static async findAll(): Promise<PrenotazioneRecord[]> {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM prenotazioni', (err: Error | null, rows: PrenotazioneRecord[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    // ricerca per id
    static async findById(id: number): Promise<PrenotazioneRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prenotazioni WHERE id_prenotazione = ?', [id], (err: Error | null, row: PrenotazioneRecord) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

export default Prenotazione;