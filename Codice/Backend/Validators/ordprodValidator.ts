import { body, param, ValidationChain } from 'express-validator'
import OrdProd from '../Models/ord_prod';
import { idProdottoValidator } from './prodottoValidator';
import { idOrdineValidator } from './ordineValidator';

// Funzioni
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

function statoProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('Stato obbligatorio')
        .isString().withMessage('Lo stato deve essere una stringa')
        .bail()
        .custom(async (nuovoStato, { req }) => {
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

            if (Array.isArray(req.body)) {
                if (statoNorm !== 'non-in-lavorazione') {
                    throw new Error("Per l'inserimento, lo stato deve essere 'non-in-lavorazione'.");
                }
                return true;
            }

            // Ottieni l'ID dell'ordine prodotto dal corpo della richiesta
            const id_ord_prod = req.body.id_ord_prod;
            if (!id_ord_prod) {
                throw new Error("ID ordine prodotto è obbligatorio.");
            }

            // Recupera l'ordine prodotto dal database
            const ordProd = await OrdProd.getById(id_ord_prod);

            // Se l'ordine prodotto esiste, controlla la transizione di stato
            if (ordProd != null) {
                const statoAttuale: string = ordProd.stato;
                const transizioniAmmesse = TRANSIZIONI_VALIDE[statoAttuale];

                // Verifica che la transizione sia consentita
                if (!transizioniAmmesse.includes(statoNorm)) {
                    throw new Error(
                        `Transizione non consentita da '${statoAttuale}' a '${statoNorm}'. ` +
                        `Transizioni ammesse: ${transizioniAmmesse.join(', ') || 'nessuna'}`
                    );
                }
            } 
            // Se l'ordine prodotto non esiste e lo stato non è "non-in-lavorazione", lancia errore
            else if (statoNorm !== 'non-in-lavorazione') {
                throw new Error("Lo stato dell'ordine prodotto deve essere 'non-in-lavorazione' per nuovi prodotti.");
            }

            return true;
        });
}

function is_romanaValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('Is_Romana prodotto obbligatorio')
        .isBoolean().withMessage('Is_Romana prodotto deve essere booleano');
}

// Validatori
export const cambiaStatoProdottoValidator = [
	idOrdProdValidator(param('id')),
	statoProdottoValidator(body('stato'))
];

export const ordProdArrayValidator = [
    idOrdineValidator(body('*.ref_ordine'),'EsistenzaOrdine'),
    idProdottoValidator(body('*.ref_prodotto')),
    statoProdottoValidator(body('*.stato')),
    is_romanaValidator(body('*.is_romana'))
];