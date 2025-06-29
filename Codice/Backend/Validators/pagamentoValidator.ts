import { ValidationChain} from 'express-validator'

export function annoPagamentoValidator(chain: ValidationChain): ValidationChain {
	return chain
		.notEmpty().withMessage('L\'anno è obbligatorio')
		.isInt({ min: 1900, max: new Date().getFullYear() })
		.withMessage(`L'anno deve essere un numero tra 1900 e ${new Date().getFullYear()}`)
		.bail();
}