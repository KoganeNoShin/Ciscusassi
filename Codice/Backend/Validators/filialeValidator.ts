import { body, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';

// Funzioni
function comuneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Il comune è obbligatorio!');
}

function indirizzoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('L\'indirizzo è obbligatorio!');
}

function num_tavoliValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('Il numero di tavoli è obbligatorio!')
        .isInt({ min: 1 }).withMessage('Il numero di tavoli deve essere un numero intero positivo')
        .toInt();
}

function longitudineValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La longitudine è obbligatoria!')
        .isFloat({ min: -180, max: 180 }).withMessage('La longitudine deve essere un numero tra -180 e 180')
        .toFloat();
}

function latitudineValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La latitudine è obbligatoria!')
        .isFloat({ min: -90, max: 90 }).withMessage('La latitudine deve essere un numero tra -90 e 90')
        .toFloat();
}

function immagineValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!');
}

function idFilialeValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'ID della filiale è obbligatorio!')
        .isInt({ min: 1 }).withMessage('L\'ID della filiale deve essere un intero positivo!')
        .toInt();
}

// Validatori
const addFilialeValidator = [
    comuneValidator(body('comune')),
    indirizzoValidator(body('indirizzo')),
    num_tavoliValidator(body('num_tavoli')),
    longitudineValidator(body('longitudine')),
    latitudineValidator(body('latitudine')),
    immagineValidator(body('immagine'))
];

const updateFilialeValidator = [
    idFilialeValidator(body('id_filiale')),
    comuneValidator(body('comune')),
    indirizzoValidator(body('indirizzo')),
    num_tavoliValidator(body('num_tavoli')),
    longitudineValidator(body('longitudine')),
    latitudineValidator(body('latitudine')),
    immagineValidator(body('immagine'))
];

const validate = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
    }
    next();
};

export default {
    validate, 
    addFilialeValidator, 
    updateFilialeValidator
}