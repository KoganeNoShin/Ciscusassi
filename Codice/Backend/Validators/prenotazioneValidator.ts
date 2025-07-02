import { body, ValidationChain } from 'express-validator'
import Filiale from '../Models/filiale';
import PrenotazioneService from '../Services/prenotazioneService';
import Prenotazione from '../Models/prenotazione';
import { idFilialeValidator } from './filialeValidator';
import { idTorrettaValidator } from './torrettaValidator';
import { numeroCartaValidator } from './clienteValidator';
import { AuthenticatedRequest } from '../Middleware/authMiddleware';


// Funzioni
function data_ora_prenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .optional({ checkFalsy: true })
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
}

function numuroPersoneValidator(chain: ValidationChain): ValidationChain {
  return chain
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo')
		.toInt()
}

export function idPrenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('ID Prenotazione obbligatorio')
        .isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
        .toInt()
        .bail()
        .custom(async (value) => {
            const esiste = await Prenotazione.getById(value);
            if (!esiste) throw new Error('La prenotazione specificata non esiste');
            return true;
        });
}

function OTPValidator(chain: ValidationChain): ValidationChain {
  return chain
    .trim()
    .notEmpty().withMessage('Indirizzo non può essere vuoto.');
}

// Validatori
export const prenotazioneInputValidator = [
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	idFilialeValidator(body('ref_filiale')),
	numuroPersoneValidator(body('numero_persone'))
];

export const prenotazioneInputLocoValidator = [
	numuroPersoneValidator(body('numero_persone')),
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	numeroCartaValidator(body('ref_cliente').optional({ nullable: true }))
];

export const checkOTPValidator = [
    OTPValidator(body('otp')),
    data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
    idTorrettaValidator(body('ref_torretta'))
];