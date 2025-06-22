import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import OrdProd from '../Models/ord_prod';
import OrdineService from '../Services/ordineService';

const aggiungiPagamentoValidator = [
    body('id_ordine')
        .notEmpty().withMessage('L\'ID dell\'ordine è obbligatorio')
        .isInt({ gt: 0 }).withMessage('L\'ID dell\'ordine deve essere un numero positivo')
        .bail()
        .custom(async (id_ordine) => {
            const ordProd = await OrdProd.getByOrdine(Number(id_ordine));

            if (ordProd && ordProd.length > 0) {
                for (const prod of ordProd) {
                    if (prod.stato !== 'consegnato') {
                        throw new Error('L\'ordine contiene prodotti non ancora consegnati.');
                    }
                }
            }

            return true;
        }),

    body('pagamento.importo')
        .notEmpty().withMessage('L\'importo è obbligatorio')
        .isFloat({ gt: 0 }).withMessage('L\'importo deve essere un numero positivo')
        .bail()
        .custom(async (valore, { req }) => {
            const id_ordine = parseInt(req.body.id_ordine);

            if (isNaN(id_ordine)) {
                throw new Error("ID ordine non valido");
            }

            const importoMinimo = await OrdineService.calcolaImportoTotale(id_ordine);

            if (parseFloat(valore) < importoMinimo) {
                throw new Error(`L'importo non può essere inferiore a ${importoMinimo.toFixed(2)}€`);
            }

            return true;
        }),

    body('pagamento.data_ora_pagamento')
        .notEmpty().withMessage('La data e ora del pagamento è obbligatoria')
        .isISO8601().withMessage('La data e ora devono essere in formato ISO 8601')
        .custom((value) => {
            const data = new Date(value);
            const now = new Date();

            if (data > now) {
                throw new Error('La data e ora del pagamento non può essere nel futuro.');
            }

            return true;
        }),
];


const eliminaOrdineValidator = [
    param('id')
        .notEmpty().withMessage('L\'ID dell\'ordine è obbligatorio')
        .isInt({ gt: 0 }).withMessage('L\'ID dell\'ordine deve essere un numero positivo')
        .bail()
        .custom(async (id) => {
        const ordProd = await OrdProd.getByOrdine(Number(id));

        if (ordProd && ordProd.length > 0) {
            throw new Error('Impossibile eliminare l\'ordine: contiene prodotti associati.');
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
    aggiungiPagamentoValidator,
    eliminaOrdineValidator
}