import { body, param, ValidationChain, validationResult} from 'express-validator'
import { Request, Response, NextFunction } from 'express';

// Funzioni
function idTorrettaValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('ID Torretta obbligatorio')
    .toInt()
    .isInt({ gt: 0 }).withMessage('ID Torretta non valido')
}

// Validatori
const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

const getTorrettaByIDValidator = [
    idTorrettaValidator(param('id_torretta'))
];

export default {
    validate,
    getTorrettaByIDValidator
}