/**
 * Credenziali minime richieste per l'autenticazione.
 */
export interface credentials {
	/** Email dell'utente */
	email: string;

	/** Password dell'utente (in chiaro, da hashare a parte) */
	password: string;
}

/**
 * Payload del token JWT generato dal sistema dopo il login.
 * Contiene le informazioni necessarie per identificare e autorizzare l'utente.
 */
export interface OurTokenPayload {
	/** ID dell'utente autenticato */
	id_utente: number;

	/** Ruolo dell'utente nel sistema */
	ruolo: 'cliente' | 'chef' | 'cameriere' | 'amministratore';

	/** Username univoco (può coincidere con nome, cognome o nickname) */
	username: string;

	/** ID della filiale associata (solo per chef, camerieri e amministratori) */
	id_filiale?: number;
}

/**
 * Dati restituiti al client dopo un login riuscito.
 */
export interface LoginRecord {
	/** Token JWT da usare per autenticare le richieste successive */
	token: string;

	/** Avatar o immagine profilo dell'utente */
	avatar: string;
}