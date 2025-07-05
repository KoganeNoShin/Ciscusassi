import { body, param, ValidationChain } from 'express-validator';
import { idFilialeValidator } from './filialeValidator';
import Impiegato from '../Models/impiegato';

// Funzioni
/**
 * Valida il nome dell'impiegato.
 * - Deve essere non vuoto.
 */
function nomeImpiegatoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage("Il nome dell'impiegato è obbligatorio");
}

/**
 * Valida il cognome dell'impiegato.
 * - Deve essere non vuoto.
 */
function cognomeImpiegatoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage("Il cognome dell'impiegato è obbligatorio");
}

/**
 * Valida il ruolo dell'impiegato.
 * - Deve essere non vuoto.
 * - Deve essere uno tra: "Amministratore", "Chef", "Cameriere".
 */
function ruoloValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage("Il ruolo dell'impiegato è obbligatorio")
		.custom((value: string) => {
			const ruoliAmmessi = ['Amministratore', 'Chef', 'Cameriere'];
			if (!ruoliAmmessi.includes(value)) {
				throw new Error(
					`Il ruolo "${value}" non è valido. Ruoli ammessi: ${ruoliAmmessi.join(', ')}.`
				);
			}
			return true;
		});
}

/**
 * Valida il campo immagine (foto).
 * - Deve essere non vuoto.
 * - Deve essere una stringa base64 con formato immagine valido: jpeg, png o webp.
 */
function fotoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'immagine è obbligatoria!")
		.matches(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
		.withMessage('Formato immagine non valido!');
}

/**
 * Valida la data di nascita.
 * - Deve essere non vuota.
 * - Deve rispettare il formato "yyyy-MM-dd".
 * - Deve rappresentare una data valida nel passato.
 * - L'impiegato deve avere almeno 18 anni (verifica età).
 */
function data_nascitaValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La data di nascita è obbligatoria')
		.matches(/^(\d{4})-(\d{2})-(\d{2})$/)
		.withMessage('La data di nascita deve essere nel formato "yyyy-MM-dd"')
		.bail()
		.custom((value: string) => {
			const dataNascita = new Date(value);
			const oggi = new Date();

			if (isNaN(dataNascita.getTime())) {
				throw new Error('La data di nascita non è valida.');
			}

			if (dataNascita >= oggi) {
				throw new Error('La data di nascita deve essere nel passato.');
			}

			// Calcolo età
			const eta = oggi.getFullYear() - dataNascita.getFullYear();
			const m = oggi.getMonth() - dataNascita.getMonth();
			const giorno = oggi.getDate() - dataNascita.getDate();
			const isUnder18 =
				eta < 18 || (eta === 18 && (m < 0 || (m === 0 && giorno < 0)));

			if (isUnder18) {
				throw new Error("L'impiegato deve avere almeno 18 anni.");
			}
			return true;
		});
}

/**
 * Valida il campo email.
 * - Deve essere non vuoto.
 * - Deve rispettare il formato di un'email valida.
 */
function emailValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage("L'email è obbligatoria")
		.isEmail()
		.withMessage("L'email deve essere valida");
}

/**
 * Valida la matricola dell’impiegato.
 * - Deve essere non vuota.
 * - Deve essere un numero intero positivo.
 * - Deve corrispondere a un impiegato esistente nel database.
 */
export function matricolaImpiegatoValidator(
	chain: ValidationChain
): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('Matricola obbligatoria')
		.isInt({ gt: 0 })
		.withMessage('Matricola non valida')
		.bail()
		.toInt()
		.custom(async (id) => {
			const impiegato = await Impiegato.getByMatricola(id);
			if (!impiegato)
				throw new Error('Impiegato non trovato nel database');
			return true;
		});
}

// Validatori
/**
 * Validatore per la creazione di un nuovo impiegato.
 * 
 * Valida i seguenti campi del body della richiesta:
 * - `nome`: deve essere non vuoto.
 * - `cognome`: deve essere non vuoto.
 * - `ruolo`: deve essere uno tra "Amministratore", "Chef", "Cameriere".
 * - `foto`: deve essere una stringa in formato immagine base64 valida (jpeg, png, webp).
 * - `email`: deve essere un'email valida e non vuota.
 * - `data_nascita`: deve essere nel formato "yyyy-MM-dd", nel passato e con età ≥ 18.
 * - `ref_filiale`: ID numerico positivo di una filiale esistente.
 */
export const addImpiegatoValidator = [
	nomeImpiegatoValidator(body('nome')),
	cognomeImpiegatoValidator(body('cognome')),
	ruoloValidator(body('ruolo')),
	fotoValidator(body('foto')),
	emailValidator(body('email')),
	data_nascitaValidator(body('data_nascita')),
	idFilialeValidator(body('ref_filiale')),
];

/**
 * Validatore per l'aggiornamento di un impiegato esistente.
 * 
 * Valida:
 * - Campi del body (come nella creazione):
 *   - `nome`, `cognome`, `ruolo`, `foto`, `data_nascita`, `ref_filiale`
 * - Parametri della route:
 *   - `matricola`: deve essere un intero > 0 e corrispondere a un impiegato registrato.
 */
export const updateImpiegatoValidator = [
	nomeImpiegatoValidator(body('nome')),
	cognomeImpiegatoValidator(body('cognome')),
	ruoloValidator(body('ruolo')),
	fotoValidator(body('foto')),
	data_nascitaValidator(body('data_nascita')),
	idFilialeValidator(body('ref_filiale')),
	matricolaImpiegatoValidator(param('matricola')),
];
