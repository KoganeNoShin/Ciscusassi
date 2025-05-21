"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const registerValidator = [
    (0, express_validator_1.body)('nome').notEmpty().withMessage("Il nome è obbligatorio"),
    (0, express_validator_1.body)('cognome').notEmpty().withMessage("Il cognome è obbligatorio"),
    (0, express_validator_1.body)('email').notEmpty().isEmail().withMessage("L'email è obbligatoria"),
    (0, express_validator_1.body)('password').notEmpty().isLength({ min: 6 }).isAlphanumeric().withMessage("La password è obbligatoria, minimo 6 caratteri ed 1 numero"),
    (0, express_validator_1.body)('confermaPassword').notEmpty().isLength({ min: 6 }).isAlphanumeric().withMessage("La conferma è obbligatoria, minimo 6 caratteri ed 1 numero"),
];
const loginValidator = [
    (0, express_validator_1.body)('email').notEmpty().isEmail().withMessage("L'email è obbligatoria"),
    (0, express_validator_1.body)('password').notEmpty().isLength({ min: 6 }).isAlphanumeric().withMessage("La password è obbligatoria, minimo 6 caratteri ed 1 numero"),
];
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.default = { validate, registerValidator, loginValidator };
