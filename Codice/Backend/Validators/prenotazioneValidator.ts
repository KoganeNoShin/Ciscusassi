import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Cliente from '../Models/cliente';
import Filiale from '../Models/filiale';
import PrenotazioneService from '../Services/prenotazioneService';


// Validatori
const dataFuturaValidator = (dataPrenotazione: Date, adesso: Date) => {
    if (dataPrenotazione < adesso) {
        throw new Error('La data e ora della prenotazione non può essere nel passato');
    }
};

const dataEntroDieciMinutiValidator = (dataPrenotazione: Date, adesso: Date) => {
    const dieciMinutiDopo = new Date(adesso.getTime() + 10 * 60 * 1000); // 10 minuti dopo l'ora corrente
    if (dataPrenotazione > dieciMinutiDopo || dataPrenotazione < adesso) {
        throw new Error('La data e ora della prenotazione deve essere entro 10 minuti da adesso');
    }
};

const data_ora_prenotazioneValidator = (field: string, tipo: 'futuro' | '10minuti') =>
    body(field)
        .notEmpty().withMessage('La data di prenotazione è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
        .custom((value: string) => {
            const orariValidi = ['12:00', '13:30', '19:30', '21:00'];
            const dataPrenotazione = new Date(value);
            const adesso = new Date();

            // Verifica che l'orario selezionato sia valido
            const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
            const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
            const orarioPrenotato = `${ore}:${minuti}`;

            if (!orariValidi.includes(orarioPrenotato)) {
                throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
            }

            // Applica il controllo corretto in base al tipo
            if (tipo === 'futuro') {
                dataFuturaValidator(dataPrenotazione, adesso); // Caso 1: data futura
            } else if (tipo === '10minuti') {
                dataEntroDieciMinutiValidator(dataPrenotazione, adesso); // Caso 2: entro 10 minuti
            }

            return true;
        });

const ref_filialeValidator = (field: string) => {
  const getValidator = param(field)
    .isInt({ min: 1 }).withMessage('ID filiale non valido')
    .bail()
    .custom(async (value) => {
      const esiste = await Filiale.getById(value);
      if (!esiste) throw new Error('La filiale specificata non esiste');
      return true;
    });

  const postPutValidator = body(field)
    .isInt({ min: 1 }).withMessage('ID filiale non valido')
    .bail()
    .custom(async (value) => {
      const esiste = await Filiale.getById(value);
      if (!esiste) throw new Error('La filiale specificata non esiste');
      return true;
    });

  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET') {
      return getValidator(req, res, next);
    } else {
      return postPutValidator(req, res, next);
    }
  };
};


const ref_clienteValidator = (field: string) =>
	body(field)
		.isInt({ min: 1 }).withMessage('Il riferimento al cliente deve essere un ID numerico valido')
		.bail()
		.custom(async (value: number) => {
			if (value === null || value === undefined) return true;
			const esiste = await Cliente.findByNumeroCarta(value);
			if (!esiste) throw new Error('Il cliente specificato non esiste');
			return true;
		});

const numuroPersoneValidator = (field: string) =>
	body(field)
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo')
		.bail()
		.custom(async (numeroPersone: number, { req }) => {
			const data = PrenotazioneService.dataToFormattedString(req.body.data_ora_prenotazione);
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

const id_prenotazioneValidator = (field: string) => {
    const getValidator = param(field)
        .isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
        .bail()
        .custom(async (value) => {
            const esiste = await Filiale.getById(value);
            if (!esiste) throw new Error('La prenotazione specificata non esiste');
            return true;
        });

    const postPutValidator = body(field)
        .isInt({ min: 1 }).withMessage('ID Prenotazione non valido')
        .bail()
        .custom(async (value) => {
            const esiste = await Filiale.getById(value);
            if (!esiste) throw new Error('La prenotazione specificata non esiste');
            return true;
        });

    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'GET') {
            return getValidator(req, res, next);
        } else {
            return postPutValidator(req, res, next);
        }
    };
};


// Validatori
const prenotazioneInputValidator = [
	data_ora_prenotazioneValidator('data_ora_prenotazione', 'futuro'),
	ref_filialeValidator('ref_filiale'),
	ref_clienteValidator('ref_cliente'),
	numuroPersoneValidator('numero_persone')
];

const prenotazioneInputLocoValidator = [
	data_ora_prenotazioneValidator('data_ora_prenotazione', '10minuti'),
	ref_filialeValidator('ref_filiale'),
	ref_clienteValidator('ref_cliente'),
	numuroPersoneValidator('numero_persone')
];

const prenotazioneUpdateValidator = [
	id_prenotazioneValidator('id_prenotazione'),
	data_ora_prenotazioneValidator('data_ora_prenotazione', 'futuro'),
	numuroPersoneValidator('numero_persone')
];

const getPrenotazioniFilialeValidator = [
	ref_filialeValidator('filiale')
];

const comfermaPrenotazioneValidator = [
	id_prenotazioneValidator('id_prenotazione')
];

const GetOTPValidator = [
	id_prenotazioneValidator('id_prenotazione')
];

const statoPrenotazioneValidator = [
	id_prenotazioneValidator('id')
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
