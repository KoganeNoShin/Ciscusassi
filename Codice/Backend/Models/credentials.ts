export interface credentials {
	emailOMatricola: string;
	password: string;
}

export interface LoginRecord {
	token: string;
	ruolo: 'cliente' | 'chef' | 'cameriere' | 'amministratore';
}
