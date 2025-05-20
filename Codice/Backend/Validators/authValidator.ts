import { body, validationResult } from 'express-validator';

const registerValidator = [
    body('nome').notEmpty().withMessage("Il nome è obbligatorio"),
    body('cognome').notEmpty().withMessage("Il cognome è obbligatorio"),
    body('email').notEmpty().isEmail().withMessage("L'email è obbligatoria"),
    body('password').notEmpty().isLength({min: 6}).isAlphanumeric().withMessage("La password è obbligatoria, minimo 6 caratteri ed 1 numero"),
    body('confermaPassword').notEmpty().isLength({min: 6}).isAlphanumeric().withMessage("La conferma è obbligatoria, minimo 6 caratteri ed 1 numero"),
]

const loginValidator = [
    body('email').notEmpty().isEmail().withMessage("L'email è obbligatoria"),
    body('password').notEmpty().isLength({min: 6}).isAlphanumeric().withMessage("La password è obbligatoria, minimo 6 caratteri ed 1 numero"),
]

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export default { validate, registerValidator, loginValidator }