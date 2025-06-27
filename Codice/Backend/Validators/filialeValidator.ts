import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import { id } from 'date-fns/locale';

// Parametri
const comuneValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('Il comune è obbligatorio!');

const indirizzoValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('L\'indirizzo è obbligatorio!');

const num_tavoliValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('Il numero di tavoli è obbligatorio!')
        .isInt({ min: 1 }).withMessage('Il numero di tavoli deve essere un numero intero positivo');

const longitudineValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('La longitudine è obbligatoria!')
        .isFloat({ min: -180, max: 180 }).withMessage('La longitudine deve essere un numero tra -180 e 180');

const latitudineValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('La latitudine è obbligatoria!')
        .isFloat({ min: -90, max: 90 }).withMessage('La latitudine deve essere un numero tra -90 e 90');

const immagineValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!');

const idFilialeValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('L\'ID della filiale è obbligatorio!')
        .isInt({ min: 1 }).withMessage('L\'ID della filiale deve essere un intero positivo!');

// Validatori
const addFilialeValidator = [
    comuneValidator('comune'),
    indirizzoValidator('indirizzo'),
    num_tavoliValidator('num_tavoli'),
    longitudineValidator('longitudine'),
    latitudineValidator('latitudine'),
    immagineValidator('immagine')
];

const updateFilialeValidator = [
    idFilialeValidator('id_filiale'),
    comuneValidator('comune'),
    indirizzoValidator('indirizzo'),
    num_tavoliValidator('num_tavoli'),
    longitudineValidator('longitudine'),
    latitudineValidator('latitudine'),
    immagineValidator('immagine')
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