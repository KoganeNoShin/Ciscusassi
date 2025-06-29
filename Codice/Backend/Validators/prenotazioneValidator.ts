import { body, param, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Filiale from '../Models/filiale';
import PrenotazioneService from '../Services/prenotazioneService';
import Prenotazione from '../Models/prenotazione';
import Torretta from '../Models/torretta';


// Funzioni
function data_ora_prenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .optional({ checkFalsy: true })
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
}

function ref_filialeValidator(chain: ValidationChain): ValidationChain {
  return chain
    .isInt({ min: 1 }).withMessage('ID filiale non valido')
    .bail()
    .custom(async (value) => {
      const esiste = await Filiale.getById(value);
      if (!esiste) throw new Error('La filiale specificata non esiste');
      return true;
    });
}


function ref_clienteValidator(chain: ValidationChain): ValidationChain {
  return chain
		.isInt({ min: 1 }).withMessage('Il riferimento al cliente deve essere un ID numerico valido')
		.bail()
		.custom(async (value: number) => {
			if (value === null || value === undefined) return true;
			const esiste = await Cliente.findByNumeroCarta(value);
			if (!esiste) throw new Error('Il cliente specificato non esiste');
			return true;
		});
}

function numuroPersoneValidator(chain: ValidationChain): ValidationChain {
  return chain
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo')
		.bail()
		.custom(async (numeroPersone: number, { req }) => {
			const data = req.body.data_ora_prenotazione;
			const filialeId = req.body.ref_filiale;

			if (!data || !filialeId) {
				throw new Error('Data e filiale sono obbligatorie per controllare i tavoli disponibili');
			}

			const filiale = await Filiale.getById(Number(filialeId));
			if (!filiale) throw new Error('Filiale non trovata');

			const tavoliTotali = filiale.num_tavoli;
			const tavoliInUso = await PrenotazioneService.calcolaTavoliInUso(filiale.id_filiale, data);
			const tavoliOccupati = tavoliInUso[data] ?? 0;

			const tavoliRichiesti = PrenotazioneService.calcolaTavoliRichiesti(Number(numeroPersone));

			if (tavoliOccupati + tavoliRichiesti > tavoliTotali) {
				const disponibili = tavoliTotali - tavoliOccupati;
				throw new Error(`Non ci sono abbastanza tavoli disponibili in quell'orario. Tavoli disponibili: ${disponibili}`);
			}

			return true;
		});
}

function id_prenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .toInt()
        .isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
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

function ref_TorrettaValidator(chain: ValidationChain): ValidationChain {
  return chain
        .toInt()
        .isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
        .bail()
        .custom(async (value) => {
            const esiste = await Torretta.getById(value);
            if (!esiste) throw new Error('La torretta specificata non esiste');
            return true;
        });
}

// Validatori
const prenotazioneInputValidator = [
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	ref_filialeValidator(body('ref_filiale')),
	ref_clienteValidator(body('ref_cliente')),
	numuroPersoneValidator(body('numero_persone'))
];

const prenotazioneUpdateValidator = [
	id_prenotazioneValidator(body('id_prenotazione')),
	data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
	numuroPersoneValidator(body('numero_persone'))
];

const CheckParamFilialeForPrenotazioniValidator = [
	ref_filialeValidator(param('filiale'))
];

const CheckIdPrenotazioneBody = [
	id_prenotazioneValidator(body('id_prenotazione'))
];

const CheckIdPrenotazioneParam = [
	id_prenotazioneValidator(param('id_prenotazione'))
];

const checkOTPValidator = [
    OTPValidator(body('otp')),
    data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
    ref_TorrettaValidator(body('ref_torretta'))
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
    prenotazioneInputValidator,
	prenotazioneUpdateValidator,
	CheckParamFilialeForPrenotazioniValidator,
	CheckIdPrenotazioneBody,
    CheckIdPrenotazioneParam,
    checkOTPValidator
}
