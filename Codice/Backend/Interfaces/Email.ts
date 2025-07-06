/**
 * Interfaccia per definire i dati contenuti dentro una mail
 * @param titolo Il titolo della mail
 * @param contenuto Il contenuto della mail
 */
export interface MailTemplateData {
	titolo: string;
	contenuto: string;
}

/**
 * Interfaccia per definire le opzioni di invio dell'email
 * @param to Indirizzo email del destinatario
 * @param subject Oggetto dell'email
 * @param data Titolo e contenuto della mail
 */
export interface MailOptions {
	to: string;
	subject: string;
	data: MailTemplateData;
}
