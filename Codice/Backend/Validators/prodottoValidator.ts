import { body, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';

// Funzioni
function nomeProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Il nome del prodotto è obbligatorio!');
}

function descrizioneProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('La descrizione del prodotto è obbligatorio!');
}

function costoProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('Il costo del prodotto è obbligatorio!')
        .isFloat({ min: 0.01 }).withMessage('Il costo deve essere un numero positivo');
}

function immagineProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'immagine del prodotto è obbligatorio!')
        .isBase64().withMessage('Formato immagine non valido!');
}

function categoriaProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La categoria del prodotto è obbligatorio!')
        .custom((value) => {
            const categorieValide = ['ANTIPASTO', 'PRIMO', 'DOLCE', 'BEVANDA'];
            if (!categorieValide.includes(value)) {
                throw new Error(`Categoria non valida: ${value}. Le categorie ammesse sono: ${categorieValide.join(', ')}`);
            }
            return true;
        });
}

// Validatori
const addProdottoValidator = [
    nomeProdottoValidator(body('nome')),
    descrizioneProdottoValidator(body('descrizione')),
    costoProdottoValidator(body('costo')),
    immagineProdottoValidator(body('immagine')),
    categoriaProdottoValidator(body('categoria'))
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