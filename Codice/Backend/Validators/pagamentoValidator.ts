import { ValidationChain } from 'express-validator';

/**
 * Valida il campo anno per la ricerca dei pagamenti.
 * 
 * - Deve essere presente (non vuoto).
 * - Deve essere un numero intero compreso tra 2000 e l'anno corrente.
 * 
 * @param chain La catena di validazione Express Validator per il campo.
 * @returns La catena di validazione con tutti i controlli applicati.
 */
export function annoPagamentoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'anno è obbligatorio")
		.isInt({ min: 2000, max: new Date().getFullYear() })
		.withMessage(`L'anno deve essere un numero tra 2000 e ${new Date().getFullYear()}`)
		.bail();
}