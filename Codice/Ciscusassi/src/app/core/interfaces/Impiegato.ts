export interface ImpiegatoData {
	nome: string;
	cognome: string;
	ruolo: string;
	foto: string;
	data_nascita: string;
	ref_filiale: number;
}

export interface ImpiegatoCredentials {
	email: string;
	password: string;
}

export interface ImpiegatoInput extends ImpiegatoData {
	email: string;
}

export interface ImpiegatoRecord extends ImpiegatoData {
	email: string;
	matricola: number;
}
