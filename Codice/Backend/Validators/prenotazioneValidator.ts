import { body, param, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Filiale from '../Models/filiale';
import PrenotazioneService from '../Services/prenotazioneService';
import Prenotazione from '../Models/prenotazione';


// Funzioni
function data_ora_prenotazioneValidator(chain: ValidationChain, minutiOffset: number): ValidationChain {
  return chain
        .optional({ checkFalsy: true })
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
        .custom((value: string) => {
            const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
            const dataPrenotazione = new Date(value);
            const adesso = new Date();
            const limiteMassimo = new Date(adesso.getTime() + minutiOffset * 60 * 1000)

            // Verifica che l'orario selezionato sia valido
            const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
            const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
            const orarioPrenotato = `${ore}:${minuti}`;

            if (!orariValidi.includes(orarioPrenotato)) {
                throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
            }

            if(dataPrenotazione < adesso){
                throw new Error('La data e ora della prenotazione non può essere nel passato');
            }
            if(minutiOffset != 0 && dataPrenotazione > limiteMassimo) {
                throw new Error('La data e ora della prenotazione deve essere entro 10 minuti da adesso');
            }
            return true;
        });
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

// Validatori
const prenotazioneInputValidator = [
	data_ora_prenotazioneValidator(body('data_ora_prenotazione'), 0),
	ref_filialeValidator(body('ref_filiale')),
	ref_clienteValidator(body('ref_cliente')),
	numuroPersoneValidator(body('numero_persone'))
];

const prenotazioneInputLocoValidator = [
	data_ora_prenotazioneValidator(body('data_ora_prenotazione'), 10),
	ref_filialeValidator(body('ref_filiale')),
	ref_clienteValidator(body('ref_cliente')),
	numuroPersoneValidator(body('numero_persone'))
];

const prenotazioneUpdateValidator = [
	id_prenotazioneValidator(body('id_prenotazione')),
	data_ora_prenotazioneValidator(body('data_ora_prenotazione'), 0),
	numuroPersoneValidator(body('numero_persone'))
];

const getPrenotazioniFilialeValidator = [
	ref_filialeValidator(param('filiale'))
];

const comfermaPrenotazioneValidator = [
	id_prenotazioneValidator(body('id_prenotazione'))
];

const GetOTPValidator = [
	id_prenotazioneValidator(param('id_prenotazione'))
];

const statoPrenotazioneValidator = [
	id_prenotazioneValidator(param('id'))
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
    prenotazioneInputLocoValidator,
	prenotazioneUpdateValidator,
	getPrenotazioniFilialeValidator,
	comfermaPrenotazioneValidator,
	GetOTPValidator,
	statoPrenotazioneValidator
}
