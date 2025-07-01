import { body, param, ValidationChain } from 'express-validator'
import Cliente from '../Models/cliente';
import Filiale from '../Models/filiale';
import PrenotazioneService from '../Services/prenotazioneService';
import Prenotazione from '../Models/prenotazione';
import Torretta from '../Models/torretta';
import { idFilialeValidator } from './filialeValidator';
import { idTorrettaValidator } from './torrettaValidator';
import { numeroCartaValidator } from './clienteValidator';


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
	...prenotazioneInputValidator,
	numeroCartaValidator(body('ref_cliente').optional({ nullable: true }))
	/*body('ref_cliente')
        .optional(true)
		.isInt({ gt: 0 }).withMessage('Numero carta non valido')
		.bail()
		.toInt()
		.custom(async (numero: number) => {
			const cliente = await Cliente.getByNumeroCarta(numero);
			if (!cliente) throw new Error('Cliente non trovato nel database');
			return true;
		})*/
];

export const checkOTPValidator = [
    OTPValidator(body('otp')),
    data_ora_prenotazioneValidator(body('data_ora_prenotazione')),
    idTorrettaValidator(body('ref_torretta'))
];