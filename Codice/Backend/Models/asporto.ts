// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un asporto
export interface AsportoInput {
    indirizzo: string,
    data_ora_consegna: string,
    ref_cliente: number
}

export interface AsportoRecord extends AsportoInput {
    id_asporto: number,
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Asporto {
  
    // definisco il metodo per creare un nuovo utente
    static async create(data: AsportoInput) : Promise<number>
    {

        const { indirizzo, data_ora_consegna, ref_cliente } = data;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO asporti (indirizzo, data_ora_consegna, ref_cliente) VALUES (?, ?, ?, ?)',
                [indirizzo, data_ora_consegna, ref_cliente],
                function(this: RunResult, err: Error | null) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti gli asporti
    static async findAll(): Promise<AsportoRecord[]>{
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM asporti', (err: Error | null, row: AsportoRecord[]) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    // ricerca per id
    static async findById(id: number) : Promise<AsportoRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM asporti WHERE id_asporto = ?', [id], (err: Error | null, row: AsportoRecord) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}