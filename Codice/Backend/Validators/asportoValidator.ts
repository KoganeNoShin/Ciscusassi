import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Prodotto from '../Models/prodotto';
import Filiale from '../Models/filiale';

const addAsportoValidator = [
    body('indirizzo')
        .notEmpty().withMessage('Indirizzo non può essere vuoto.'),
    
    body('data_ora_consegna')
        .notEmpty().withMessage('La data di consegna è obbligatoria')
        .isISO8601().withMessage('La data di consegna deve essere nel formato ISO8601')
        .custom((value) => {
            const dataConsegna = new Date(value);
            if(dataConsegna.getTime() <= Date.now()) throw new Error('La data di consegna deve essere nel futuro.');
            return true;
        }),

    body('ref_cliente')
        .notEmpty().notEmpty().withMessage('Cliente obbligatorio!')
        .isInt({ min: 1}).withMessage('Riferimento non valido, deve essere un numero intero positivo')
        .custom(async (value) => {
            const cliente = await Cliente.findByNumeroCarta(value);
            if(!cliente) throw new Error('Cliente inesistente, ricontrolla ID!');
            return true;
        }),

    body('ref_filiale')
        .notEmpty().notEmpty().withMessage('Filiale obbligatoria!')
        .isInt({ min: 1}).withMessage('Riferimento non valido, deve essere un numero intero positivo')
        .custom(async (value) => {
            const filiale = await Filiale.getById(value);
            if(!filiale) throw new Error('Filiale inesistente, ricontrolla ID!');
            return true;
        }),

    body('importo')
        .notEmpty().withMessage('L\'importo è obbligatorio')
        .isFloat({ min: 0.01 }).withMessage('Importo non valido, deve essere un numero positivo'),
    
    body('data_ora_pagamento')
        .notEmpty().withMessage('La data di pagamento è obbligatoria')
        .isISO8601().withMessage('La data di pagamento deve essere nel formato ISO8601')
        .custom((value) => {
            const dataConsegna = new Date(value);
            if(dataConsegna.getTime() > Date.now()) throw new Error('La data di pagamento deve essere nel passato o attuale.');
            return true;
        }),

    body('prodotti')
    .isArray({ min: 1 }).withMessage('Devi specificare almeno un prodotto.')
    .custom(async (prodotti) => {
        if (!prodotti.every((id: any) => Number.isInteger(id) && id > 0)) throw new Error('Tutti gli ID prodotti devono essere numeri interi positivi.');
        
        for(const p of prodotti) { 
            const prodotto = await Prodotto.getByID(p);
            if(!prodotto) throw new Error(`Prodotto con Id ${p} non esiste`);
        }

        return true;
    }),
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