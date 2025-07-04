import { body, param, ValidationChain } from 'express-validator';
import Cliente from '../Models/cliente';

// Funzioni campo per campo

function nomeClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage('Il nome è obbligatorio')
		.isLength({ max: 50 })
		.withMessage('Il nome non può superare 50 caratteri');
}

function cognomeClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage('Il cognome è obbligatorio')
		.isLength({ max: 50 })
		.withMessage('Il cognome non può superare 50 caratteri');
}

export function emailClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage("L'email è obbligatoria")
		.isEmail()
		.withMessage("L'email deve essere valida");
}

function passwordClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La password è obbligatoria')
		.isLength({ min: 6 })
		.withMessage('La password deve contenere almeno 6 caratteri');
}

function imageClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'immagine è obbligatoria")
		.matches(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
		.withMessage('Formato immagine non valido');
}

function dataNascitaClienteValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La data di nascita è obbligatoria')
		.matches(/^(\d{4})-(\d{2})-(\d{2})$/)
		.withMessage('La data deve essere nel formato "yyyy-MM-dd"')
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

export function numeroCartaValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('Il numero della carta è obbligatorio')
		.isInt({ gt: 0 })
		.withMessage('Numero carta non valido')
		.bail()
		.toInt()
		.custom(async (numero: number) => {
			const cliente = await Cliente.getByNumeroCarta(numero);
			if (!cliente) throw new Error('Cliente non trovato nel database');
			return true;
		});
}

// Validatori principali
export const aggiornaPasswordValidator: ValidationChain[] = [
	passwordClienteValidator(body('nuovaPassword')),
	body('confermaPassword')
		.notEmpty()
		.withMessage('La conferma password è obbligatoria')
		.custom((value, { req }) => {
			if (value !== req.body.nuovaPassword) {
				throw new Error('Le password non coincidono');
			}
			return true;
		}),
];

export const addClienteValidator = [
	nomeClienteValidator(body('nome')),
	cognomeClienteValidator(body('cognome')),
	emailClienteValidator(body('email')),
	...aggiornaPasswordValidator,
	imageClienteValidator(body('image')),
	dataNascitaClienteValidator(body('data_nascita')),
];

export const updateClienteValidator = [
	nomeClienteValidator(body('nome')),
	cognomeClienteValidator(body('cognome')),
	emailClienteValidator(body('email')),
	imageClienteValidator(body('image')),
	dataNascitaClienteValidator(body('data_nascita')),
];
