import { body, param, ValidationChain } from 'express-validator';
import Cliente from '../Models/cliente';

/**
 * Valida il campo "nome":
 * - Rimuove spazi iniziali e finali
 * - Richiede che non sia vuoto
 * - Lunghezza massima 50 caratteri
 */
function nomeClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty().withMessage('Il nome è obbligatorio')
		.isLength({ max: 50 }).withMessage('Il nome non può superare 50 caratteri');
}

/**
 * Valida il campo "cognome":
 * - Rimuove spazi
 * - Richiede valore non vuoto
 * - Massimo 50 caratteri
 */
function cognomeClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty().withMessage('Il cognome è obbligatorio')
		.isLength({ max: 50 }).withMessage('Il cognome non può superare 50 caratteri');
}

/**
 * Valida l'email del cliente:
 * - Rimuove spazi
 * - Deve essere presente
 * - Deve essere in formato email valido
 */
export function emailClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty().withMessage("L'email è obbligatoria")
		.isEmail().withMessage("L'email deve essere valida");
}

/**
 * Valida la password:
 * - Richiede un minimo di 6 caratteri
 */
function passwordClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('La password è obbligatoria')
		.isLength({ min: 6 }).withMessage('La password deve contenere almeno 6 caratteri');
}

/**
 * Valida l'immagine profilo del cliente:
 * - Deve essere una stringa base64 valida in uno dei formati accettati: jpeg, png o webp
 */
function imageClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage("L'immagine è obbligatoria")
		.matches(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
		.withMessage('Formato immagine non valido');
}

/**
 * Valida la data di nascita:
 * - Deve essere nel formato "yyyy-MM-dd"
 * - Deve essere una data passata
 * - Il cliente deve avere almeno 18 anni
 */
function dataNascitaClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('La data di nascita è obbligatoria')
		.matches(/^(\d{4})-(\d{2})-(\d{2})$/).withMessage('La data deve essere nel formato "yyyy-MM-dd"')
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

			// Calcolo dell’età per verifica maggiore età
			const eta = oggi.getFullYear() - dataNascita.getFullYear();
			const m = oggi.getMonth() - dataNascita.getMonth();
			const giorno = oggi.getDate() - dataNascita.getDate();
			const isUnder18 =
				eta < 18 || (eta === 18 && (m < 0 || (m === 0 && giorno < 0)));

			if (isUnder18) {
				throw new Error('Il cliente deve avere almeno 18 anni.');
			}
			return true;
		});
}

/**
 * Valida il numero della carta (intero positivo) e verifica che il cliente esista nel DB:
 * - Deve essere un intero maggiore di zero
 * - Viene convertito in intero
 * - Controlla l'esistenza nel DB tramite `Cliente.getByNumeroCarta`
 */
export function numeroCartaValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('Il numero della carta è obbligatorio')
		.isInt({ gt: 0 }).withMessage('Numero carta non valido')
		.bail()
		.toInt()
		.custom(async (numero: number) => {
			const cliente = await Cliente.getByNumeroCarta(numero);
			if (!cliente) {
				throw new Error('Cliente non trovato nel database');
			}
			return true;
		});
}

// ------------------ VALIDATORI PRINCIPALI ------------------

/**
 * Validatore per la modifica password del cliente:
 * - Verifica che la nuova password sia valida
 * - Verifica che la conferma coincida
 */
export const aggiornaPasswordValidator: ValidationChain[] = [
	passwordClienteValidator(body('nuovaPassword')),
	body('confermaPassword')
		.notEmpty().withMessage('La conferma password è obbligatoria')
		.custom((value, { req }) => {
			if (value !== req.body.nuovaPassword) {
				throw new Error('Le password non coincidono');
			}
			return true;
		}),
];

/**
 * Validatore completo per la registrazione di un cliente.
 * Include nome, cognome, email, password (con conferma), immagine e data di nascita.
 */
export const addClienteValidator = [
	nomeClienteValidator(body('nome')),
	cognomeClienteValidator(body('cognome')),
	emailClienteValidator(body('email')),
	...aggiornaPasswordValidator,
	imageClienteValidator(body('image')),
	dataNascitaClienteValidator(body('data_nascita')),
];

/**
 * Validatore per aggiornare i dati anagrafici e immagine di un cliente.
 * Esclude la password.
 */
export const updateClienteValidator = [
	nomeClienteValidator(body('nome')),
	cognomeClienteValidator(body('cognome')),
	emailClienteValidator(body('email')),
	imageClienteValidator(body('image')),
	dataNascitaClienteValidator(body('data_nascita')),
];