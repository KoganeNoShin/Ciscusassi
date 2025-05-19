export interface Prodotto {
    id_prodotto: number;
    nome: string;
    descrizione: string;
    costo: number;
    immagine: string;
    categoria: string;
    is_piatto_giorno: boolean;
}