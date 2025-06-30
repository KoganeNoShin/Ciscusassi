import { body, param, ValidationChain } from 'express-validator'
import Prodotto from '../Models/prodotto';

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

export function idProdottoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('ID prodotto è obbligatorio!')
        .isInt({ min: 1 }).withMessage('ID prodotto non valido')
        .toInt()
        .custom(async (value) => {
              const esiste = await Prodotto.getByID(value);
              if (!esiste) throw new Error('Il prodotto specificato non esiste');
              return true;
            });
}

// Validatori
export const addProdottoValidator = [
    nomeProdottoValidator(body('nome')),
    descrizioneProdottoValidator(body('descrizione')),
    costoProdottoValidator(body('costo')),
    immagineProdottoValidator(body('immagine')),
    categoriaProdottoValidator(body('categoria'))
];

export const updateProdottoValidator = [
    ...addProdottoValidator,
    idProdottoValidator(param('id'))
];