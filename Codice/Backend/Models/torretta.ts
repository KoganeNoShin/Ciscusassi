// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di una Torretta
export interface TorrettaInput {
    ref_filiale: number;
}
export interface TorrettaRecord extends TorrettaInput {
    id_torretta: number;
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Torretta {
  
    // definisco il metodo per creare un nuovo utente
    static async create(data: TorrettaInput) : Promise<number>
    {

        const { ref_filiale } = data;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO torrette (ref_filiale) VALUES (?)',
                [ref_filiale],
                function(this: RunResult, err: Error | null) {
                    if (err) reject(err);
                    else resolve(this.lastID);
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutte le torrette
    static async findAll(): Promise<TorrettaRecord[]> {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM torrette', (err: Error | null, rows: TorrettaRecord[]) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
    
    // ricerca per id
    static async findById(id: number): Promise<TorrettaRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM torrette WHERE id_torretta = ?', [id], (err: Error | null, row: TorrettaRecord) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }
}

export default Torretta;