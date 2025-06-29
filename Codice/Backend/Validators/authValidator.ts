import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validatori
const nomeValidator = (field: string) =>
	body(field)
		.trim()
        .notEmpty().withMessage('Il nome è obbligatorio')
		.isString().withMessage('Il nome deve essere una stringa');

const cognomeValidator = (field: string) =>
	body(field)
		.trim()
        .notEmpty().withMessage('Il cognome è obbligatorio')
		.isString().withMessage('Il cognome deve essere una stringa');

const emailValidator = (field: string) =>
	body(field)
		.trim()
        .notEmpty().withMessage("L'email è obbligatoria")
		.isEmail().withMessage("L'email deve essere valida");
	
const passwordValidator = (field: string) =>
	body(field)
		.notEmpty().withMessage('La password è obbligatoria')
		.isLength({ min: 6 }).withMessage('La password deve essere lunga almeno 6 caratteri');

// Metto il controllo delle lettere minuscole, maiuscole, numeri e caratteri speciali qua perché è comune a entrambi i campi
// e in login non serve controllare, in registrazione sì		
const confermaPasswordValidator = (field: string) =>
	body(field)
		.notEmpty().withMessage('La conferma password è obbligatoria')
		.isLength({ min: 6 }).withMessage('La conferma password deve essere lunga almeno 6 caratteri')
		.matches(/[a-z]/).withMessage('La password deve contenere almeno una lettera minuscola') // Aggiunto controllo minuscole
        .matches(/[A-Z]/).withMessage('La password deve contenere almeno una lettera maiuscola') // Aggiunto controllo maiuscole
        .matches(/[0-9]/).withMessage('La password deve contenere almeno un numero') // Aggiunto controllo numeri
        .matches(/[@$!%*?&]/).withMessage('La password deve contenere almeno un carattere speciale') // Aggiunto controllo caratteri speciali
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error('Le password non corrispondono');
			}
			return true;
		});

// Validatori
const registerValidator = [
	nomeValidator('nome'),
	cognomeValidator('cognome'),
	emailValidator('email'),
	passwordValidator('password'),
	confermaPasswordValidator('conferma_password')
];

const loginValidator = [
	emailValidator('email'),
	passwordValidator('password')
];

const validate = (req: Request, res: Response, next: NextFunction): void => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

export default { validate, registerValidator, loginValidator };
