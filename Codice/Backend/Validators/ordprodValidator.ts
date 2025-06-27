import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Ordine from '../Models/ordine';
import OrdProd from '../Models/ord_prod';

// Parametri
const idOrdineValidator = (field: string) =>
    param(field)
        .notEmpty().withMessage('ID ordine obbligatorio')
        .isInt({ gt: 0 }).withMessage('ID ordine non valido')
        .bail()
        .custom(async (id) => {
            const ordine = await Ordine.getById(Number(id));
            if (!ordine) throw new Error('Ordine non trovato nel database');
            return true;
        });

const idOrdProdValidator = (field: string) =>
    param(field)
        .notEmpty().withMessage('ID ordine prodotto obbligatorio')
        .isInt({ gt: 0 }).withMessage('ID ordine prodotto non valido')
        .bail()
        .custom(async (id) => {
            const prodotto = await OrdProd.getById(Number(id));
            if (!prodotto) throw new Error('Prodotto non trovato nel database');
            return true;
        });

const statoProdottoValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('Stato obbligatorio')
        .isString().withMessage('Lo stato deve essere una stringa')
        .bail()
        .custom((nuovoStato, { req }) => {
            const statoNorm = nuovoStato.toLowerCase();
			const STATI_VALIDI = ['non-in-lavorazione', 'preparazione', 'in-consegna', 'consegnato'];
			const TRANSIZIONI_VALIDE: Record<string, string[]> = {
				'non-in-lavorazione': ['preparazione'],
				'preparazione': ['in-consegna'],
				'in-consegna': ['consegnato', 'non-in-lavorazione'],
				'consegnato': []
			};

            // Verifica che lo stato sia valido
            if (!STATI_VALIDI.includes(statoNorm)) {
                throw new Error(`Stato non valido. Valori ammessi: ${STATI_VALIDI.join(', ')}`);
            }

            // Ottieni lo stato attuale
            const statoAttuale: string = req.currentStato;

            // Ottieni le transizioni ammesse per lo stato attuale
            const transizioniAmmesse = TRANSIZIONI_VALIDE[statoAttuale];

            // Verifica che la transizione sia consentita
            if (!transizioniAmmesse.includes(statoNorm)) {
                throw new Error(
                    `Transizione non consentita da '${statoAttuale}' a '${statoNorm}'. ` +
                    `Transizioni ammesse: ${transizioniAmmesse.join(', ') || 'nessuna'}`
                );
            }

            return true;
        });

// Validatori
const getProdottiByOrdineValidator = [
	idOrdineValidator('id')
];

const cambiaStatoProdottoValidator = [
	idOrdProdValidator('id'),
	statoProdottoValidator('stato')
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