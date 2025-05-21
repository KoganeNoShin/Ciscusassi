// importo il db
import db from '../db';
import { RunResult } from 'sqlite3';

// Definiamo il modello di un Prodotto
export interface ProdottoInput {
    nome: string;
    descrizione: string;
    costo: number;
    immagine: string;
    categoria: string;
    is_piatto_giorno: boolean;
}
export interface ProdottoRecord extends ProdottoInput {
    id_prodotto: number; 
}

// Interagisce direttamente con il database per le operazioni CRUD sugli utenti
export class Prodotto {
  
    // definisco il metodo per creare un nuovo utente
    static async create(data: ProdottoInput) : Promise<number>{

        const { nome, descrizione, costo, immagine, categoria, is_piatto_giorno } = data;

        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO prodotti (id_prodotto, nome, descrizione, costo, immagine, categoria, is_piatto_giorno) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [nome, descrizione, costo, immagine, categoria, is_piatto_giorno],
                function(this: RunResult, err: Error | null) {
                    if (err) reject(err);
                    resolve(this.lastID);
                }
            );
        });
    }

    // definiamo il metodo per ritornare tutti i prodotti
    static async findAll(): Promise<ProdottoRecord[]> {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM prodotti p ORDER BY p.categoria DESC', (err: Error | null, row: ProdottoRecord[]) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    static async getPiattoDelGiorno(): Promise<ProdottoRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prodotti WHERE is_piatto_giorno = 1',  (err: Error | null, row: ProdottoRecord) => {
                if (err) reject(err);
                resolve(row);
            }); 
        });
    }
    
    // ricerca per id
    static async findById(id: number) : Promise<ProdottoRecord> {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM prodotti WHERE id_prodotto = ?', [id], (err: Error | null, row: ProdottoRecord) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

}