import { param, ValidationChain } from 'express-validator'

// Funzioni
export function idTorrettaValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('ID Torretta obbligatorio')
    .toInt()
    .isInt({ gt: 0 }).withMessage('ID Torretta non valido')
}

// Validatori
const getTorrettaByIDValidator = [
    idTorrettaValidator(param('id_torretta'))
];