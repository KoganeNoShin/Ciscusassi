import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Prodotto from '../Models/prodotto';
import Filiale from '../Models/filiale';

// Parametri
const indirizzoValidator = (field: string) =>
    body(field)
        .trim()
        .notEmpty().withMessage('Indirizzo non può essere vuoto.');

const dataOraConsegnaValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('La data di consegna è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di consegna deve essere nel formato "yyyy-MM-dd HH:mm"')
        .bail()
        .custom((value: string) => {
            const dataConsegna = new Date(value);
            if (isNaN(dataConsegna.getTime())) {
                throw new Error('La data di consegna non è valida.');
            }
            if (dataConsegna.getTime() <= Date.now()) {
                throw new Error('La data di consegna deve essere nel futuro.');
            }
            return true;
        });

const ref_clienteValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('Cliente obbligatorio!')
        .isInt({ min: 1}).withMessage('Riferimento non valido, deve essere un numero intero positivo')
        .bail()
        .custom(async (value: number) => {
            const cliente = await Cliente.findByNumeroCarta(value);
            if(!cliente) throw new Error('Cliente inesistente, ricontrolla ID!');
            return true;
        });

const ref_filialeValidator = (field: string) =>
    body(field)
        .notEmpty().notEmpty().withMessage('Filiale obbligatoria!')
        .isInt({ min: 1}).withMessage('Riferimento non valido, deve essere un numero intero positivo')
        .bail()
        .custom(async (value: number) => {
            const filiale = await Filiale.getById(value);
            if(!filiale) throw new Error('Filiale inesistente, ricontrolla ID!');
            return true;
        });

const importoValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('L\'importo è obbligatorio')
        .isFloat({ min: 0.01 }).withMessage('Importo non valido, deve essere un numero positivo');

const dataOraPagamentoValidator = (field: string) =>
    body('data_ora_pagamento')
        .notEmpty().withMessage('La data di pagamento è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di pagamento deve essere nel formato ISO8601')
        .bail()
        .custom((value: string) => {
            const dataConsegna = new Date(value);
            if(dataConsegna.getTime() > Date.now()) throw new Error('La data di pagamento deve essere nel passato o attuale.');
            return true;
        });

const prodottiValidator = (field: string) =>
    body(field)
    .isArray({ min: 1 }).withMessage('Devi specificare almeno un prodotto.')
    .bail()
    .custom(async (prodotti) => {
        if (!prodotti.every((id: any) => Number.isInteger(id) && id > 0)) throw new Error('Tutti gli ID prodotti devono essere numeri interi positivi.');
        
        for(const p of prodotti) { 
            const prodotto = await Prodotto.getByID(p);
            if(!prodotto) throw new Error(`Prodotto con Id ${p} non esiste`);
        }

        return true;
    });

// Validatori
const addAsportoValidator = [
   indirizzoValidator('indirizzo'),
    dataOraConsegnaValidator('data_ora_consegna'),
    ref_clienteValidator('ref_cliente'),
    ref_filialeValidator('ref_filiale'),
    importoValidator('importo'),
    dataOraPagamentoValidator('data_ora_pagamento'),
    prodottiValidator('prodotti')
];

const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export default {validate, addAsportoValidator}