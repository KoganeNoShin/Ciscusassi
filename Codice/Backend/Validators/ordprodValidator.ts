import { body, param, ValidationChain } from 'express-validator';
import OrdProd from '../Models/ord_prod';
import { idProdottoValidator } from './prodottoValidator';
import { idOrdineValidator } from './ordineValidator';

/**
 * Valida il parametro `id_ordprod`:
 * - Obbligatorio
 * - Deve essere un intero positivo
 * - Verifica che l'ordine prodotto esista nel database
 */
function idOrdProdValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('ID ordine prodotto obbligatorio')
    .isInt({ gt: 0 }).withMessage('ID ordine prodotto non valido')
    .bail()
    .toInt()
    .custom(async (id) => {
      const prodotto = await OrdProd.getById(Number(id));
      if (!prodotto) throw new Error('Prodotto non trovato nel database');
      return true;
    });
}

/**
 * Valida il campo `stato`:
 * - Obbligatorio
 * - Deve essere una stringa e uno degli stati ammessi
 * - Se si tratta di una modifica singola (non array), verifica che la transizione di stato sia consentita.
 * - Se si tratta di un inserimento (array), accetta solo `non-in-lavorazione`.
 *
 * Stati validi:
 * - non-in-lavorazione → in-lavorazione
 * - in-lavorazione → in-consegna
 * - in-consegna → consegnato / non-in-lavorazione
 * - consegnato → (nessuna transizione ammessa)
 */
function statoProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('Stato obbligatorio')
    .isString().withMessage('Lo stato deve essere una stringa')
    .bail()
    .custom(async (nuovoStato, { req }) => {
      const statoNorm = nuovoStato.toLowerCase();
      const STATI_VALIDI = ['non-in-lavorazione', 'in-lavorazione', 'in-consegna', 'consegnato'];
      const TRANSIZIONI_VALIDE: Record<string, string[]> = {
        'non-in-lavorazione': ['in-lavorazione'],
        'in-lavorazione': ['in-consegna'],
        'in-consegna': ['consegnato', 'non-in-lavorazione'],
        'consegnato': []
      };

      // Stato valido?
      if (!STATI_VALIDI.includes(statoNorm)) {
        throw new Error(`Stato non valido. Valori ammessi: ${STATI_VALIDI.join(', ')}`);
      }

      // Se è un array (inserimento multiplo), lo stato deve essere "non-in-lavorazione"
      if (Array.isArray(req.body)) {
        if (statoNorm !== 'non-in-lavorazione') {
          throw new Error("Per l'inserimento, lo stato deve essere 'non-in-lavorazione'.");
        }
        return true;
      }

      // Validazione transizione per update singolo
      if (!req.params?.id_ordprod) {
        throw new Error("ID ordine prodotto è obbligatorio.");
      }
      const id_ord_prod = Number(req.params.id_ordprod);
      const ordProd = await OrdProd.getById(id_ord_prod);

      if (ordProd != null) {
        const statoAttuale: string = ordProd.stato;
        const transizioniAmmesse = TRANSIZIONI_VALIDE[statoAttuale];

        if (!transizioniAmmesse.includes(statoNorm)) {
          throw new Error(
            `Transizione non consentita da '${statoAttuale}' a '${statoNorm}'. ` +
            `Transizioni ammesse: ${transizioniAmmesse.join(', ') || 'nessuna'}`
          );
        }
      } else if (statoNorm !== 'non-in-lavorazione') {
        throw new Error("Lo stato dell'ordine prodotto deve essere 'non-in-lavorazione' per nuovi prodotti.");
      }

      return true;
    });
}

/**
 * Valida il campo `is_romana`:
 * - Obbligatorio
 * - Deve essere booleano
 */
function is_romanaValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('Is_Romana prodotto obbligatorio')
    .isBoolean().withMessage('Is_Romana prodotto deve essere booleano');
}

// === Validatori ===

/**
 * Valida il cambio di stato di un singolo ordine prodotto.
 */
export const cambiaStatoProdottoValidator = [
  idOrdProdValidator(param('id_ordprod')),
  statoProdottoValidator(body('stato'))
];

/**
 * Valida un array di ordine-prodotti in inserimento:
 * - ref_ordine esistente
 * - ref_prodotto esistente
 * - stato iniziale valido (solo "non-in-lavorazione")
 * - is_romana booleano
 */
export const ordProdArrayValidator = [
  idOrdineValidator(body('*.ref_ordine'), 'EsistenzaOrdine'),
  idProdottoValidator(body('*.ref_prodotto')),
  statoProdottoValidator(body('*.stato')),
  is_romanaValidator(body('*.is_romana'))
];

/**
 * Valida la modifica del campo `is_romana` per un singolo ordine prodotto.
 */
export const CambioRomanaValidator = [
  idOrdProdValidator(param('id_ordprod')),
  is_romanaValidator(body('isRomana'))
];