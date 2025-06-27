export interface Credentials {
	email: string;
	password: string;
}

export interface OurTokenPayload {
	id_utente: number;
	ruolo: 'cliente' | 'chef' | 'cameriere' | 'amministratore';
	username: string;
	id_filiale?: number;
}

export interface LoginRecord {
	token: string;
	avatar: string;
}
