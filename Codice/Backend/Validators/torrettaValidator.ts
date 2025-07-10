import { param, ValidationChain } from 'express-validator'

/**
 * Valida l'ID della torretta:
 * - Verifica che il campo non sia vuoto
 * - Converte il valore in intero
 * - Controlla che sia un intero positivo maggiore di zero
 * 
 * @param chain La catena di validazione su cui applicare le regole (tipicamente `param('id_torretta')` o `body('ref_torretta')`)
 * @returns La catena di validazione aggiornata
 */
export function idTorrettaValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('ID Torretta obbligatorio')    
    .isInt({ gt: 0 }).withMessage('ID Torretta non valido')
    .toInt();
}