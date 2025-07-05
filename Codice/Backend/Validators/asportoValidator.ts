import { body, ValidationChain } from 'express-validator';
import Prodotto from '../Models/prodotto';
import { idFilialeValidator } from './filialeValidator';

/**
 * Valida il campo "indirizzo" assicurandosi che non sia vuoto e sia stato ripulito da spazi.
 */
function indirizzoValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage('Indirizzo non può essere vuoto.');
}

/**
 * Valida la data di consegna:
 * - Il formato deve essere "yyyy-MM-dd HH:mm"
 * - Deve essere una data valida
 * - Deve essere una data futura rispetto al momento della richiesta
 */
function dataOraConsegnaValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('La data di consegna è obbligatoria')
    .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/)
      .withMessage('La data di consegna deve essere nel formato "yyyy-MM-dd HH:mm"')
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

/**
 * Valida il campo "importo":
 * - Deve essere presente
 * - Deve essere un numero positivo maggiore di 0
 */
function importoValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('L\'importo è obbligatorio')
    .isFloat({ min: 0.01 }).withMessage('Importo non valido, deve essere un numero positivo')
    .toFloat();
}

/**
 * Valida la data di pagamento:
 * - Deve avere il formato "yyyy-MM-dd HH:mm"
 * - Deve rappresentare una data valida
 * - Deve essere nel passato o nel momento attuale
 */
function dataOraPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('La data di pagamento è obbligatoria')
    .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/)
      .withMessage('La data di pagamento deve essere nel formato ISO8601')
    .bail()
    .custom((value: string) => {
      const dataPagamento = new Date(value);
      if (dataPagamento.getTime() > Date.now()) {
        throw new Error('La data di pagamento deve essere nel passato o attuale.');
      }
      return true;
    });
}

/**
 * Valida la lista di prodotti selezionati:
 * - Deve essere un array non vuoto
 * - Ogni elemento deve essere un intero positivo
 * - Ogni ID prodotto deve esistere realmente nel database
 */
function prodottiValidator(chain: ValidationChain): ValidationChain {
  return chain
    .isArray({ min: 1 }).withMessage('Devi specificare almeno un prodotto.')
    .bail()
    .custom(async (prodotti) => {
      // Verifica che tutti gli elementi siano interi positivi
      if (!prodotti.every((id: any) => Number.isInteger(id) && id > 0)) {
        throw new Error('Tutti gli ID prodotti devono essere numeri interi positivi.');
      }

      // Controlla l'esistenza di ciascun prodotto nel database
      for (const p of prodotti) {
        const prodotto = await Prodotto.getByID(p);
        if (!prodotto) {
          throw new Error(`Prodotto con ID ${p} non esiste.`);
        }
      }

      return true;
    });
}

// Validatore composto per la rotta POST /asporto
export const addAsportoValidator = [
  indirizzoValidator(body('indirizzo')),
  dataOraConsegnaValidator(body('data_ora_consegna')),
  idFilialeValidator(body('ref_filiale')),
  importoValidator(body('importo')),
  dataOraPagamentoValidator(body('data_ora_pagamento')),
  prodottiValidator(body('prodotti'))
];