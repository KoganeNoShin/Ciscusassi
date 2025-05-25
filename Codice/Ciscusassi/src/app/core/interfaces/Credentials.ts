export interface Credentials {
	emailOMatricola: string;
	password: string;
}

export interface LoginRecord {
	token: string;
	ruolo: 'cliente' | 'chef' | 'cameriere' | 'amministratore';
	username: string;
	avatar: string;
}
