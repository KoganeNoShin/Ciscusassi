import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import OrdProd from '../Models/ord_prod';
import OrdineService from '../Services/ordineService';
import Prodotto from '../Models/prodotto';
import Ordine from '../Models/ordine';

// Parametri
const idOrdineValidator = (field: string, isPagamento: boolean = false) => {
    return (req: Request) => {
        // Se la richiesta è DELETE, usa param per estrarre l'ID dall'URL
        if (req.method === 'DELETE') {
            return param(field)  // Uso param per ottenere l'ID dalla route
                .notEmpty().withMessage('L\'ID dell\'ordine è obbligatorio')
                .isInt({ gt: 0 }).withMessage('L\'ID dell\'ordine deve essere un numero positivo')
                .bail()
                .custom(async (id) => {
                    const ordine = await Ordine.getById(id);
                    if(ordine == null) {
                        throw new Error("Ordine non esistente")
                    }

                    const ordProd = await OrdProd.getByOrdine(Number(id));

                    if (ordProd && ordProd.length > 0) {
                        throw new Error('Impossibile eliminare l\'ordine: contiene prodotti associati.');
                    }

                    return true;
                    })
        } else {
            // Se la richiesta è POST/GET, usa body per ottenere l'ID dal corpo della richiesta
            return body(field)  // Uso body per ottenere l'ID dal corpo
                .notEmpty().withMessage('L\'ID dell\'ordine è obbligatorio')
                .isInt({ gt: 0 }).withMessage('L\'ID dell\'ordine deve essere un numero positivo')
                .bail()
                .custom(async (id_ordine) => {
                    const ordine = await Ordine.getById(id_ordine);
                    if(ordine == null) {
                        throw new Error("Ordine non esistente")
                    }

                    const ordProd = await OrdProd.getByOrdine(Number(id_ordine));
                    if (!ordProd || ordProd.length === 0) {
                        throw new Error('ID ordine senza prodotti ordinati');
                    }

                    if (isPagamento) {
                        // Se è per il pagamento, verifica che tutti i prodotti siano consegnati
                        for (const prod of ordProd) {
                            if (prod.stato !== 'consegnato') {
                                throw new Error('L\'ordine contiene prodotti non ancora consegnati.');
                            }
                        }
                    }
                    return true;
                });
        }
    };
};

 const importoPagamentoValidator = (field: string) =>
    body(field)
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
        });
        
const dataOraPagamentoValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('La data e ora del pagamento è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
        .custom((value) => {
            const data = new Date(value);
            const now = new Date();

            if (data > now) {
                throw new Error('La data e ora del pagamento non può essere nel futuro.');
            }

            return true;
        });
         
const aggiungiPagamentoValidator = [
    idOrdineValidator('id_ordine'),
    importoPagamentoValidator('pagamento.importo'),
    dataOraPagamentoValidator('pagamento.data_ora_pagamento')
];


const eliminaOrdineValidator = [
    idOrdineValidator('id')
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