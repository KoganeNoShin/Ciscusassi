export interface Credentials {
	email: string;
	password: string;
}

export interface RegistrationData {
  nome: string;
  cognome: string;
  data_nascita: string;
  image: string;
  email: string;
  nuovaPassword: string;
  confermaPassword: string;
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
