import { body, ValidationChain } from 'express-validator'
import Prodotto from '../Models/prodotto';
import { idFilialeValidator } from './filialeValidator';

// Funzioni
function indirizzoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Indirizzo non può essere vuoto.');
}

function dataOraConsegnaValidator(chain: ValidationChain): ValidationChain {
  return chain
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
}

function importoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'importo è obbligatorio')
        .isFloat({ min: 0.01 }).withMessage('Importo non valido, deve essere un numero positivo')
        .toFloat();
}

function dataOraPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La data di pagamento è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di pagamento deve essere nel formato ISO8601')
        .bail()
        .custom((value: string) => {
            const dataConsegna = new Date(value);
            if(dataConsegna.getTime() > Date.now()) throw new Error('La data di pagamento deve essere nel passato o attuale.');
            return true;
        });
}

function prodottiValidator(chain: ValidationChain): ValidationChain {
  return chain
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
}

// Validatori
export const addAsportoValidator = [
    indirizzoValidator(body('indirizzo')),
    dataOraConsegnaValidator(body('data_ora_consegna')),
    idFilialeValidator(body('ref_filiale')),
    importoValidator(body('importo')),
    dataOraPagamentoValidator(body('data_ora_pagamento')),
    prodottiValidator(body('prodotti'))
];