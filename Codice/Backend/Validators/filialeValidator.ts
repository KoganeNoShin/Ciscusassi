import { body, param, ValidationChain } from 'express-validator';

/**
 * Valida che il campo "comune" sia presente e non vuoto.
 * Deve essere una stringa non vuota.
 */
function comuneValidator(chain: ValidationChain): ValidationChain {
	return chain.trim().notEmpty().withMessage('Il comune è obbligatorio!');
}

/**
 * Valida che il campo "indirizzo" sia presente e non vuoto.
 * Deve essere una stringa non vuota.
 */
function indirizzoValidator(chain: ValidationChain): ValidationChain {
	return chain.trim().notEmpty().withMessage("L'indirizzo è obbligatorio!");
}

/**
 * Valida che il numero di tavoli sia:
 * - presente
 * - un intero maggiore o uguale a 1
 */
function num_tavoliValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('Il numero di tavoli è obbligatorio!')
		.isInt({ min: 1 })
		.withMessage('Il numero di tavoli deve essere un numero intero positivo')
		.toInt();
}

/**
 * Valida che la longitudine sia:
 * - presente
 * - un numero decimale compreso tra -180 e 180
 */
function longitudineValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La longitudine è obbligatoria!')
		.isFloat({ min: -180, max: 180 })
		.withMessage('La longitudine deve essere un numero tra -180 e 180')
		.toFloat();
}

/**
 * Valida che la latitudine sia:
 * - presente
 * - un numero decimale compreso tra -90 e 90
 */
function latitudineValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La latitudine è obbligatoria!')
		.isFloat({ min: -90, max: 90 })
		.withMessage('La latitudine deve essere un numero tra -90 e 90')
		.toFloat();
}

/**
 * Valida che il campo immagine sia presente e nel formato base64 corretto.
 * Il formato accettato è: `data:image/{jpeg|png|webp};base64,...`
 */
function immagineValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'immagine è obbligatoria!")
		.matches(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
		.withMessage('Formato immagine non valido!');
}

/**
 * Valida che l'ID della filiale sia:
 * - presente
 * - un intero positivo
 */
export function idFilialeValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'ID della filiale è obbligatorio!")
		.isInt({ min: 1 })
		.withMessage("L'ID della filiale deve essere un intero positivo!")
		.toInt();
}

/**
 * Validatore per la creazione di una nuova filiale.
 * Valida i seguenti campi nel corpo della richiesta:
 * - `comune`: stringa non vuota
 * - `indirizzo`: stringa non vuota
 * - `num_tavoli`: intero >= 1
 * - `longitudine`: float tra -180 e 180
 * - `latitudine`: float tra -90 e 90
 * - `immagine`: stringa base64 valida
 */
export const addFilialeValidator = [
	comuneValidator(body('comune')),
	indirizzoValidator(body('indirizzo')),
	num_tavoliValidator(body('num_tavoli')),
	longitudineValidator(body('longitudine')),
	latitudineValidator(body('latitudine')),
	immagineValidator(body('immagine')),
];

/**
 * Validatore per la modifica di una filiale esistente.
 * Valida:
 * - `id_filiale`: parametro route, intero positivo
 * - gli stessi campi validati nella creazione (vedi `addFilialeValidator`)
 */
export const updateFilialeValidator = [
	idFilialeValidator(param('id_filiale')),
	...addFilialeValidator,
];