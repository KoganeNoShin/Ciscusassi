import { body, param, ValidationChain } from 'express-validator';
import Prodotto from '../Models/prodotto';

/**
 * Valida che il nome del prodotto non sia vuoto.
 */
function nomeProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage('Il nome del prodotto è obbligatorio!');
}

/**
 * Valida che la descrizione del prodotto non sia vuota.
 */
function descrizioneProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.trim()
		.notEmpty()
		.withMessage('La descrizione del prodotto è obbligatoria!');
}

/**
 * Valida che il costo del prodotto sia specificato e sia un numero positivo.
 */
function costoProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('Il costo del prodotto è obbligatorio!')
		.isFloat({ min: 0.01 })
		.withMessage('Il costo deve essere un numero positivo');
}

/**
 * Valida che l'immagine sia fornita in formato base64 corretto.
 */
function immagineProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage("L'immagine del prodotto è obbligatoria!")
		.matches(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/)
		.withMessage('Formato immagine non valido!');
}

/**
 * Valida che la categoria sia una delle categorie ammesse.
 * Le categorie ammesse sono: 'ANTIPASTO', 'PRIMO', 'DOLCE', 'BEVANDA'.
 * 
 * @custom Verifica che il valore sia contenuto nella lista predefinita.
 */
function categoriaProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('La categoria del prodotto è obbligatoria!')
		.custom((value) => {
			const categorieValide = ['ANTIPASTO', 'PRIMO', 'DOLCE', 'BEVANDA'];
			if (!categorieValide.includes(value)) {
				throw new Error(
					`Categoria non valida: ${value}. Le categorie ammesse sono: ${categorieValide.join(', ')}`
				);
			}
			return true;
		});
}

/**
 * Valida l'ID del prodotto, assicurandosi che:
 * - sia fornito,
 * - sia un intero positivo,
 * - corrisponda a un prodotto esistente nel database.
 * 
 * @custom Verifica l'esistenza del prodotto tramite `Prodotto.getByID`
 */
export function idProdottoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty()
		.withMessage('ID prodotto è obbligatorio!')
		.isInt({ min: 1 })
		.withMessage('ID prodotto non valido')
		.toInt()
		.custom(async (value) => {
			const esiste = await Prodotto.getByID(value);
			if (!esiste) throw new Error('Il prodotto specificato non esiste');
			return true;
		});
}

// Validatori principali
export const addProdottoValidator = [
	nomeProdottoValidator(body('nome')),
	descrizioneProdottoValidator(body('descrizione')),
	costoProdottoValidator(body('costo')),
	immagineProdottoValidator(body('immagine')),
	categoriaProdottoValidator(body('categoria')),
];

export const updateProdottoValidator = [
	...addProdottoValidator,
	idProdottoValidator(param('id_prodotto')),
];