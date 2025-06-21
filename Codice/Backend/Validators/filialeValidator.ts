import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';

const addFilialeValidator = [
    body('comune')
    .notEmpty().withMessage('Il comune è obbligatorio!'),

    body('indirizzo')
        .notEmpty().withMessage('L\'indirizzo è obbligatorio!'),

    body('num_tavoli')
        .notEmpty().withMessage('Il numero di tavoli è obbligatorio!')
        .isInt({ min: 1 }).withMessage('Il numero di tavoli deve essere un numero intero positivo'),

    body('longitudine')
        .notEmpty().withMessage('La longitudine è obbligatoria!')
        .isFloat({ min: -180, max: 180 }).withMessage('La longitudine deve essere un numero tra -180 e 180'),

    body('latitudine')
        .notEmpty().withMessage('La latitudine è obbligatoria!')
        .isFloat({ min: -90, max: 90 }).withMessage('La latitudine deve essere un numero tra -90 e 90'),

    body('immagine')
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!'),

];

const updateFilialeValidator = [
    body('id_filiale')
    .notEmpty().withMessage('L\'ID della filiale è obbligatorio!')
    .isInt({ min: 1 }).withMessage('L\'ID della filiale deve essere un intero positivo!'),

    body('comune')
    .notEmpty().withMessage('Il comune è obbligatorio!'),

    body('indirizzo')
        .notEmpty().withMessage('L\'indirizzo è obbligatorio!'),

    body('num_tavoli')
        .notEmpty().withMessage('Il numero di tavoli è obbligatorio!')
        .isInt({ min: 1 }).withMessage('Il numero di tavoli deve essere un numero intero positivo'),

    body('longitudine')
        .notEmpty().withMessage('La longitudine è obbligatoria!')
        .isFloat({ min: -180, max: 180 }).withMessage('La longitudine deve essere un numero tra -180 e 180'),

    body('latitudine')
        .notEmpty().withMessage('La latitudine è obbligatoria!')
        .isFloat({ min: -90, max: 90 }).withMessage('La latitudine deve essere un numero tra -90 e 90'),

    body('immagine')
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!'),
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