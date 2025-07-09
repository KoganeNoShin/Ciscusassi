import { MailTemplateData, MailOptions } from '../Interfaces/Email';
import Cliente from '../Models/cliente';
import Impiegato, {
	ImpiegatoData,
	ImpiegatoInput,
	ImpiegatoRecord,
} from '../Models/impiegato';
import AuthService from './authService';
import EmailService from './emailService';

class ImpiegatoService {
	/**
	 * Crea un nuovo impiegato nel database e invia via email le credenziali generate.
	 * @param nome Nome dell'impiegato
	 * @param cognome Cognome dell'impiegato
	 * @param ruolo Ruolo dell'impiegato (es. chef, cameriere, amministratore)
	 * @param foto URL o path dell'immagine del profilo
	 * @param email Email dell'impiegato
	 * @param data_nascita Data di nascita (formato ISO)
	 * @param ref_filiale ID della filiale di appartenenza
	 * @returns ID dell'impiegato appena creato
	 */
	static async addImpiegato(
		nome: string,
		cognome: string,
		ruolo: string,
		foto: string,
		email: string,
		data_nascita: string,
		ref_filiale: number
	): Promise<number> {
		try {
			//Check email
			const existingCliente = await Cliente.getByEmail(email);
			const existingImpiegato = await Impiegato.getByEmail(email);
			if (existingCliente || existingImpiegato) {
				console.error(
					'❌ [ClienteService Error] register: email già registrata:',
					email
				);
				throw new Error('Email già registrata');
			}

			// Genera una password sicura
			const NotHashedPassword = AuthService.generateRandomPassword();
			const password = await AuthService.hashPassword(NotHashedPassword);

			const impiegato: ImpiegatoInput = {
				nome,
				cognome,
				ruolo,
				foto,
				email,
				data_nascita,
				ref_filiale,
				password,
			};

			// Salva l'impiegato nel DB
			const idImpiegato = await Impiegato.create(impiegato);

			const mailTemplateData: MailTemplateData = {
				titolo: `Nuova Assunzione`,
				contenuto: `Ciao ${nome} ${cognome}, sei stato assunto nel ruolo di ${ruolo}, ecco la tua password per accedere al pannello di controllo: ${NotHashedPassword}`,
			};

			// Invio credenziali via email
			const mailOptions: MailOptions = {
				to: email,
				subject: 'Nuova Assunzione',
				data: mailTemplateData,
			};

			await EmailService.sendMail(mailOptions);

			return idImpiegato;
		} catch (error) {
			console.error(
				"❌ [ImpiegatoService] Errore durante l'aggiunta dell'impiegato:",
				error
			);
			throw error;
		}
	}

	/**
	 * Aggiorna i dati di un impiegato.
	 * @param input Oggetto con i nuovi dati dell'impiegato
	 * @param matricola Matricola dell'impiegato da aggiornare
	 */
	static async updateImpiegato(
		input: ImpiegatoData,
		matricola: number
	): Promise<void> {
		try {
			await Impiegato.updateImpiegato(input, matricola);
		} catch (error) {
			console.error(
				"❌ [ImpiegatoService] Errore durante l'aggiornamento dell'impiegato:",
				error
			);
			throw error;
		}
	}

	/**
	 * Elimina un impiegato dal database.
	 * @param matricola Matricola dell'impiegato da rimuovere
	 */
	static async deleteImpiegato(matricola: number): Promise<void> {
		try {
			await Impiegato.deleteImpiegato(matricola);
		} catch (error) {
			console.error(
				"❌ [ImpiegatoService] Errore durante l'eliminazione dell'impiegato:",
				error
			);
			throw error;
		}
	}

	/**
	 * Recupera tutti gli impiegati associati a una determinata filiale.
	 * @param id_filiale ID della filiale
	 * @returns Array di impiegati oppure null
	 */
	static async getByFiliale(
		id_filiale: number
	): Promise<ImpiegatoRecord[] | null> {
		try {
			return await Impiegato.getByFiliale(id_filiale);
		} catch (error) {
			console.error(
				'❌ [ImpiegatoService] Errore durante la selezione degli impiegato:',
				error
			);
			throw error;
		}
	}

	/**
	 * Aggiorna la password di un impiegato (es. durante reset o cambio credenziali).
	 * @param matricola Matricola dell'impiegato
	 * @param passwordChiara Nuova password non criptata
	 */
	static async aggiornaPassword(
		matricola: number,
		passwordChiara: string
	): Promise<void> {
		try {
			const hashedPassword =
				await AuthService.hashPassword(passwordChiara);
			await Impiegato.aggiornaPassword(matricola, hashedPassword);
		} catch (err) {
			console.error('❌ [ImpiegatoService Error] aggiornaPassword:', err);
			throw new Error("Errore durante l'aggiornamento della password");
		}
	}
}

export default ImpiegatoService;
