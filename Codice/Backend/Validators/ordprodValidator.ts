import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Ordine from '../Models/ordine';
import OrdProd from '../Models/ord_prod';

const getProdottiByOrdineValidator = [
	param('id')
		.notEmpty().withMessage('ID ordine obbligatorio')
		.isInt({ gt: 0 }).withMessage('ID ordine non valido')
		.bail()
		.custom(async (id) => {
			const ordine = await Ordine.getById(Number(id));
			if (!ordine) throw new Error('Ordine non trovato nel database');
			return true;
		})
];

const STATI_VALIDI = ['non-in-lavorazione', 'preparazione', 'in-consegna', 'consegnato'];
const TRANSIZIONI_VALIDE: Record<string, string[]> = {
	'non-in-lavorazione': ['preparazione'],
	'preparazione': ['in-consegna'],
	'in-consegna': ['consegnato', 'non-in-lavorazione'],
	'consegnato': []
};

export const cambiaStatoProdottoValidator = [
	param('id')
		.notEmpty().withMessage('ID prodotto obbligatorio')
		.isInt({ gt: 0 }).withMessage('ID prodotto non valido')
		.bail()
		.custom(async (id) => {
			const prod = await OrdProd.getById(Number(id));
			if (!prod) throw new Error('Prodotto non trovato nel database');
			return true;
		}),

	body('stato')
		.notEmpty().withMessage('Stato obbligatorio')
		.isString().withMessage('Lo stato deve essere una stringa')
		.bail()
		.custom((nuovoStato, { req }) => {
			const statoNorm = nuovoStato.toLowerCase();

			if (!STATI_VALIDI.includes(statoNorm)) {
				throw new Error(`Stato non valido. Valori ammessi: ${STATI_VALIDI.join(', ')}`);
			}

			const statoAttuale: string = req.currentStato;

			const transizioniAmmesse = TRANSIZIONI_VALIDE[statoAttuale];
			if (!transizioniAmmesse.includes(statoNorm)) {
				throw new Error(
					`Transizione non consentita da '${statoAttuale}' a '${statoNorm}'. ` +
					`Transizioni ammesse: ${transizioniAmmesse.join(', ') || 'nessuna'}`
				);
			}

			return true;
		})
];

const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export default {
    validate,
    getProdottiByOrdineValidator,
    cambiaStatoProdottoValidator
}