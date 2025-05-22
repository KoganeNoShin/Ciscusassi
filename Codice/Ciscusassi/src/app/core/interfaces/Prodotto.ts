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
