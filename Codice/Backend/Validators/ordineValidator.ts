import { body, param, ValidationChain } from 'express-validator';
import OrdProd from '../Models/ord_prod';
import OrdineService from '../Services/ordineService';
import Ordine from '../Models/ordine';
import { idPrenotazioneValidator } from './prenotazioneValidator';

/**
 * Valida l'ID di un ordine in base al tipo di operazione richiesto.
 * Le regole di validazione variano a seconda del contesto operativo.
 *
 * @param chain - Catena di validazione per il campo `id_ordine`.
 * @param operazione - Specifica il contesto dell’operazione:
 *
 *   - `"EsistenzaOrdine"`:
 *     - Verifica che l'ID sia un numero intero positivo.
 *     - Controlla che l'ordine esista nel database.
 *
 *   - `"Eliminazione"`:
 *     - Tutti i controlli di "EsistenzaOrdine".
 *     - Impedisce l’eliminazione se esistono prodotti associati all’ordine.
 *
 *   - `"Pagamento"`:
 *     - Tutti i controlli di "EsistenzaOrdine".
 *     - Verifica che l'ordine abbia almeno un prodotto associato.
 *     - Tutti i prodotti dell’ordine devono essere nello stato `"consegnato"`.
 *     - L'ordine non deve essere già stato pagato (`ref_pagamento === null`).
 *
 * @returns La catena di validazione con i controlli definiti in base all’operazione.
 */
export function idOrdineValidator(chain: ValidationChain, operazione: string): ValidationChain {
  return chain
    .notEmpty().withMessage("L'ID dell'ordine è obbligatorio")
    .isInt({ gt: 0 }).withMessage("L'ID dell'ordine deve essere un numero positivo")
    .bail()
    .toInt()
    .custom(async (id: number) => {
      const ordine = await Ordine.getById(id);
      if (!ordine) throw new Error("Ordine non esistente");

      if (operazione !== "EsistenzaOrdine") {
        const ordProd = await OrdProd.getByOrdine(id);

        if (operazione === 'Eliminazione') {
          if (ordProd && ordProd.length > 0) {
            throw new Error("Impossibile eliminare l'ordine: contiene prodotti associati.");
          }
        } else {
          if (!ordProd || ordProd.length === 0) {
            throw new Error("ID ordine senza prodotti ordinati");
          }

          if (operazione === "Pagamento") {
            for (const prod of ordProd) {
              if (prod.stato !== 'consegnato') {
                throw new Error("L'ordine contiene prodotti non ancora consegnati.");
              }
            }

            if (ordine.ref_pagamento != null) {
              throw new Error("L'ordine è gia stato pagato.");
            }
          }
        }
      }

      return true;
    });
}

/**
 * Valida l'importo del pagamento:
 * - Deve essere positivo
 * - Deve essere almeno pari all'importo minimo calcolato lato server
 */
function importoPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('L\'importo è obbligatorio')
    .isFloat({ gt: 0 }).withMessage('L\'importo deve essere un numero positivo')
    .bail()
    .custom(async (valore, { req }) => {
      const id_ordine = parseInt(req.body.id_ordine);
      if (isNaN(id_ordine)) throw new Error("ID ordine non valido");

      const importoMinimo = await OrdineService.calcolaImportoTotale(id_ordine, false);

      if (parseFloat(valore) < importoMinimo) {
        throw new Error(`L'importo non può essere inferiore a ${importoMinimo.toFixed(2)}€`);
      }

      return true;
    });
}

/**
 * Valida la data e ora del pagamento:
 * - Deve essere presente
 * - Deve seguire il formato "yyyy-MM-dd HH:mm"
 * - Non può essere nel futuro
 */
function dataOraPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
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
}

/**
 * Valida il campo username ordinante:
 * - Obbligatorio
 * - Deve rispettare il formato "nome.cognome.annodinascita"
 */
function username_ordinanteValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage('Username ordinante è obbligatorio')
    .matches(/^[a-z]+\.[a-z]+\.[0-9]{4}$/i).withMessage('Formato username non valido (nome.cognome.annodinascita)');
}

// ======= Validator exports =======

/**
 * Validatore per l'inserimento di un nuovo ordine
 */
export const addOrdineValidator = [
  idPrenotazioneValidator(body('ref_prenotazione')),
  username_ordinanteValidator(body('username_ordinante')),
];

/**
 * Validatore per l'inserimento di un pagamento associato a un ordine
 */
export const addPagamentoValidator = [
  idOrdineValidator(body('id_ordine'), 'Pagamento'),
  importoPagamentoValidator(body('pagamento_importo')),
  dataOraPagamentoValidator(body('data_ora_pagamento'))
];

/**
 * Validatore per ottenere un ID ordine tramite ID prenotazione e username
 */
export const getIDOrdineByPrenotazioneAndUsername = [
  idPrenotazioneValidator(param('id_prenotazione')),
  username_ordinanteValidator(param('username'))
];