import { body, ValidationChain } from 'express-validator';

/**
 * Valida il campo "nome":
 * - Rimuove spazi superflui
 * - Controlla che non sia vuoto
 * - Verifica che sia una stringa
 */
function nomeValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage('Il nome è obbligatorio')
    .isString().withMessage('Il nome deve essere una stringa');
}

/**
 * Valida il campo "cognome":
 * - Rimuove spazi superflui
 * - Controlla che non sia vuoto
 * - Verifica che sia una stringa
 */
function cognomeValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage('Il cognome è obbligatorio')
    .isString().withMessage('Il cognome deve essere una stringa');
}

/**
 * Valida il campo "email":
 * - Rimuove spazi superflui
 * - Controlla che non sia vuoto
 * - Verifica che sia un'email in formato valido
 */
export function emailValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage("L'email è obbligatoria")
    .isEmail().withMessage("L'email deve essere valida");
}

/**
 * Valida il campo "password":
 * - Controlla che non sia vuoto
 * - Deve avere almeno 6 caratteri
 * - Non vengono applicati controlli su maiuscole/minuscole/simboli (solo su conferma)
 */
function passwordValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('La password è obbligatoria')
    .isLength({ min: 6 }).withMessage('La password deve essere lunga almeno 6 caratteri');
}

/**
 * Valida il campo "conferma_password":
 * - Controlla che non sia vuoto
 * - Deve avere almeno 6 caratteri
 * - Deve contenere almeno una lettera minuscola, una maiuscola, un numero e un carattere speciale
 * - Deve corrispondere esattamente al campo "password"
 */
function confermaPasswordValidator(chain: ValidationChain): ValidationChain {
  return chain
    .notEmpty().withMessage('La conferma password è obbligatoria')
    .isLength({ min: 6 }).withMessage('La conferma password deve essere lunga almeno 6 caratteri')
    .matches(/[a-z]/).withMessage('La password deve contenere almeno una lettera minuscola')
    .matches(/[A-Z]/).withMessage('La password deve contenere almeno una lettera maiuscola')
    .matches(/[0-9]/).withMessage('La password deve contenere almeno un numero')
    .matches(/[@$!%*?&]/).withMessage('La password deve contenere almeno un carattere speciale')
    .custom((value, { req }) => {
      // Verifica che la conferma corrisponda alla password
      if (value !== req.body.password) {
        throw new Error('Le password non corrispondono');
      }
      return true;
    });
}

// ----- Validatori da esportare -----

/**
 * Validatore per la registrazione di un utente.
 * Controlla nome, cognome, email, password e conferma password con tutte le regole di sicurezza.
 */
export const registerValidator = [
  nomeValidator(body('nome')),
  cognomeValidator(body('cognome')),
  emailValidator(body('email')),
  passwordValidator(body('password')),
  confermaPasswordValidator(body('conferma_password'))
];

/**
 * Validatore per il login.
 * Controlla solo email e password, senza ulteriori requisiti.
 */
export const loginValidator = [
  emailValidator(body('email')),
  passwordValidator(body('password')),
];