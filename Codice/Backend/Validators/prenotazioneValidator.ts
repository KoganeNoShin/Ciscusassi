import { body, ValidationChain } from 'express-validator'
import Prenotazione from '../Models/prenotazione';
import { idFilialeValidator } from './filialeValidator';
import { idTorrettaValidator } from './torrettaValidator';
import { numeroCartaValidator } from './clienteValidator';


// Funzioni
function data_ora_prenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La data e ora della prenotazione è obbligatoria')
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
	numeroCartaValidator(body('ref_cliente')
    .custom(async (numeroCarta: number, { req }) => {
      // Verifica se il cliente ha già una prenotazione futura
      const cliente = await Prenotazione.getByCliente(numeroCarta);

      // Ottieni la data attuale
      const adesso = new Date();

      // Controlla se esiste una prenotazione futura per questo cliente
      const prenotazioniFuturo = cliente.filter(p => new Date(p.data_ora_prenotazione) >= adesso);

      if (prenotazioniFuturo.length > 0) {
        throw new Error('Il cliente ha già una prenotazione futura. Non è possibile fare una nuova prenotazione.');
      }

      return true;
    }))
];

export const checkOTPValidator = [
    OTPValidator(body('otp')),
    data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
    idTorrettaValidator(body('ref_torretta'))
];