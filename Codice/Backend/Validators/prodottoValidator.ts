import { body, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';

const addProdottoValidator = [
    body('nome')
        .notEmpty().withMessage('Il nome del prodotto è obbligatorio!'),
    
    body('descrizione')
        .notEmpty().withMessage('La descrizione del prodotto è obbligatorio!'),

    body('costo')
        .notEmpty().withMessage('Il costo del prodotto è obbligatorio!')
        .isFloat({ min: 0.01 }).withMessage('Il costo deve essere un numero positivo'),

    body('immagine')
        .notEmpty().withMessage('L\'immagine del prodotto è obbligatorio!')
        .isBase64().withMessage('Formato immagine non valido!'),
    
    body('categoria')
        .notEmpty().withMessage('La categoria del prodotto è obbligatorio!')
        .custom((value) => {
            const categorieValide = ['ANTIPASTO', 'PRIMO', 'DOLCE', 'BEVANDA'];
            if (!categorieValide.includes(value)) {
                throw new Error(`Categoria non valida: ${value}. Le categorie ammesse sono: ${categorieValide.join(', ')}`);
            }
            return true;
        })
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
    addProdottoValidator
}