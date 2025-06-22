import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Prenotazione from '../Models/prenotazione';
import Cliente from '../Models/cliente';
import Torretta from '../Models/torretta';
import Filiale from '../Models/filiale';

const orariValidi = ['12:00', '13:30', '19:30', '21:00'];

export const prenotazioneInputValidator = [
	// numero_persone
	body('numero_persone')
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo'),

	// data_ora_prenotazione
	body('data_ora_prenotazione')
		.notEmpty().withMessage('La data e ora della prenotazione è obbligatoria!')
		.isISO8601().withMessage('La data e ora devono essere in formato ISO 8601')
		.custom((value) => {
			const dataPrenotazione = new Date(value);
			const adesso = new Date();

			if (dataPrenotazione < adesso) {
				throw new Error('La data e ora della prenotazione non può essere nel passato');
			}

			const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
			const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
			const orarioPrenotato = `${ore}:${minuti}`;

			if (!orariValidi.includes(orarioPrenotato)) {
				throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
			}

			return true;
		}),

	// ref_cliente
	body('ref_cliente')
		.isInt({ min: 1 }).withMessage('Il riferimento al cliente deve essere un ID numerico valido')
		.bail()
		.custom(async (value) => {
			if (value === null || value === undefined) return true;
			const esiste = await Cliente.findByNumeroCarta(value);
			if (!esiste) throw new Error('Il cliente specificato non esiste');
			return true;
		}),

	// ref_filiale
	body('ref_filiale')
		.notEmpty().withMessage('La filiale è obbligatoria')
		.isInt({ min: 1 }).withMessage('ID filiale non valido')
		.bail()
		.custom(async (value) => {
			const esiste = await Filiale.getById(value);
			if (!esiste) throw new Error('La filiale specificata non esiste');
			return true;
		}),
];

export const prenotazioneInputLocoValidator = [
	// numero_persone
	body('numero_persone')
		.notEmpty().withMessage('Il numero di persone è obbligatorio!')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo'),

	// data_ora_prenotazione
	body('data_ora_prenotazione')
		.notEmpty().withMessage('La data e ora della prenotazione è obbligatoria!')
		.isISO8601().withMessage('La data e ora devono essere in formato ISO 8601')
		.custom((value) => {
			const dataPrenotazione = new Date(value);
			const adesso = new Date();

			if (dataPrenotazione < adesso) {
				throw new Error('La data e ora della prenotazione non può essere nel passato');
			}

			const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
			const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
			const orarioPrenotato = `${ore}:${minuti}`;

			if (!orariValidi.includes(orarioPrenotato)) {
				throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
			}

			return true;
		}),

	// ref_cliente (opzionale)
	body('ref_cliente')
		.optional({ nullable: true })
		.isInt({ min: 1 }).withMessage('Il riferimento al cliente deve essere un ID numerico valido')
		.bail()
		.custom(async (value) => {
			if (value === null || value === undefined) return true;
			const esiste = await Cliente.findByNumeroCarta(value);
			if (!esiste) throw new Error('Il cliente specificato non esiste');
			return true;
		}),

	// ref_torretta (opzionale, ID valido ed esistente)
	body('ref_torretta')
		.isInt({ min: 1 }).withMessage('Il riferimento alla torretta deve essere un ID numerico valido')
		.bail()
		.custom(async (value) => {
			if (value === null || value === undefined) return true;

			const torrettaEsistente = await Torretta.getById(value);
			if (!torrettaEsistente) {
				throw new Error('La torretta specificata non esiste');
			}
			return true;
		}),
];

export const prenotazioneUpdateValidator = [
	// ID prenotazione
	body('id_prenotazione')
		.notEmpty().withMessage('L\'ID della prenotazione è obbligatorio!')
		.isInt({ min: 1 }).withMessage('L\'ID della prenotazione deve essere un intero positivo')
		.bail()
		.custom(async (id) => {
			const pren = await Prenotazione.getById(id);
			if (!pren) {
				throw new Error('Prenotazione non trovata');
			}
			return true;
		}),

	// numero_persone
	body('numero_persone')
		.isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo'),

	// data_ora_prenotazione
	body('data_ora_prenotazione')
		.notEmpty().withMessage('La data e ora della prenotazione è obbligatoria!')
		.isISO8601().withMessage('La data e ora devono essere in formato ISO 8601')
		.bail()
		.custom(async (value, { req }) => {
			const id = req.body.id_prenotazione;
			const pren = await Prenotazione.getById(id);
			if (!pren) throw new Error('Prenotazione non trovata');

			const nuovaData = new Date(value);
			const vecchiaData = new Date(pren.data_ora_prenotazione);

			if (nuovaData < vecchiaData) {
				throw new Error('La nuova data/ora deve essere uguale o successiva a quella esistente');
			}

			const ore = nuovaData.getHours().toString().padStart(2, '0');
			const minuti = nuovaData.getMinutes().toString().padStart(2, '0');
			const orarioPrenotato = `${ore}:${minuti}`;

			if (!orariValidi.includes(orarioPrenotato)) {
				throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
			}

			return true;
		}),
];

const getPrenotazioniDelGiornoValidator = [
	param('filiale')
		.notEmpty().withMessage('ID filiale obbligatorio')
		.isInt({ min: 1 }).withMessage('ID filiale deve essere un intero positivo')
    .bail()
		.custom(async (value) => {
			const id = parseInt(value);
			const filialeEsiste = await Filiale.getById(id);
			if (!filialeEsiste) {
				throw new Error('La filiale specificata non esiste');
			}
			return true;
		}),
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
    getPrenotazioniDelGiornoValidator,
}
