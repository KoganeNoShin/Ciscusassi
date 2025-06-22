import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Prenotazione from '../Models/prenotazione';
import Cliente from '../Models/cliente';
import Torretta from '../Models/torretta';
import Filiale from '../Models/filiale';

const prenotazioneInputValidator = [
  body('numero_persone')
    .notEmpty().withMessage('Il numero di persone è obbligatorio!')
    .isInt({ min: 1 }).withMessage('Il numero di persone deve essere un intero positivo'),

  body('data_ora_prenotazione')
    .notEmpty().withMessage('La data e ora della prenotazione è obbligatoria!')
    .isISO8601().withMessage('La data e ora devono essere in formato ISO 8601')
    .custom((value) => {
      const dataPrenotazione = new Date(value);
      const adesso = new Date();

      if (dataPrenotazione < adesso) {
        throw new Error('La data e ora della prenotazione non può essere nel passato');
      }

      // Estrai orario (hh:mm) dalla data
      const ore = dataPrenotazione.getHours().toString().padStart(2, '0');
      const minuti = dataPrenotazione.getMinutes().toString().padStart(2, '0');
      const orarioPrenotato = `${ore}:${minuti}`;

      const orariValidi = ['12:00', '13:30', '19:30', '21:00'];

      if (!orariValidi.includes(orarioPrenotato)) {
        throw new Error(`L'orario selezionato (${orarioPrenotato}) non è valido. Orari disponibili: ${orariValidi.join(', ')}`);
      }

      return true;
  }),

  body('ref_cliente')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Il riferimento al cliente deve essere un ID numerico valido')
    .bail()
    .custom(async (value) => {
      if (value === null) return true;

      const clienteEsistente = await Cliente.findByNumeroCarta(value);
      if (!clienteEsistente) {
        throw new Error('Il cliente specificato non esiste');
      }

      return true;
    })
];


const prenotazioneInputLocoValidator = [
  ...prenotazioneInputValidator,

  body('otp')
    .optional({ nullable: true })
    .isLength({ min: 6, max: 6 }).withMessage('L\'OTP deve essere una stringa di 4-6 caratteri'),

  body('ref_torretta')
    .optional({ nullable: true })
    .isInt({ min: 1 }).withMessage('Il riferimento alla torretta deve essere un ID numerico valido')
    .bail()
    .custom(async (value) => {
      if (value === null) return true;

      const torrettaEsistente = await Torretta.findById(value);
      if (!torrettaEsistente) {
        throw new Error('La torretta specificata non esiste');
      }

      return true;
    })
];


const prenotazioneUpdateValidator = [
  body('id_prenotazione')
    .notEmpty().withMessage('L\'ID della prenotazione è obbligatorio!')
    .isInt({ min: 1 }).withMessage('L\'ID della prenotazione deve essere un intero positivo'),

  ...prenotazioneInputLocoValidator,

  body('data_ora_prenotazione').custom(async (value, { req }) => {
    const id = req.body.id_prenotazione;
    const pren = await Prenotazione.getById(id);

    if (!pren) {
      throw new Error('Prenotazione non trovata');
    }

    const nuovaData = new Date(value);
    const vecchiaData = new Date(pren.data_ora_prenotazione);

    if (nuovaData < vecchiaData) {
      throw new Error('La nuova data/ora deve essere uguale o successiva a quella esistente');
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
