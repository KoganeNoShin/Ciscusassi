import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import Filiale from '../Models/filiale';

// Parametri
const nomeImpiegatoValidator = (field: string) =>
    body(field)
        .trim()
        .notEmpty().withMessage('Il nome dell\'impiegato è obbligatorio');

const cognomeImpiegatoValidator = (field: string) =>
    body(field)
        .trim()
        .notEmpty().withMessage('Il cognome dell\'impiegato è obbligatorio');

const ruoloValidator = (field: string) =>
    body(field)
        .trim()
        .notEmpty().withMessage('Il ruolo dell\'impiegato è obbligatorio')
        .custom((value: string) => {
            const ruoliAmmessi = ['Amministratore', 'Chef', 'Cameriere'];
            if (!ruoliAmmessi.includes(value)) {
                throw new Error(`Il ruolo "${value}" non è valido. Ruoli ammessi: ${ruoliAmmessi.join(', ')}.`);
            }
            return true;
        });

const fotoValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!');

const data_nascitaValidator = (field: string) =>
    body(field)
        .notEmpty().withMessage('La data di consegna è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di consegna deve essere nel formato "yyyy-MM-dd HH:mm"')
        .bail() 
        .custom((value: string) => {
            const dataNascita = new Date(value);
            const oggi = new Date();

            if (isNaN(dataNascita.getTime())) {
                throw new Error('La data di nascita non è valida.');
            }

            if (dataNascita >= oggi) {
                throw new Error('La data di nascita deve essere nel passato.');
            }

            // Calcolo età
            const eta = oggi.getFullYear() - dataNascita.getFullYear();
            const m = oggi.getMonth() - dataNascita.getMonth();
            const giorno = oggi.getDate() - dataNascita.getDate();
            const isUnder18 = (eta < 18) || (eta === 18 && (m < 0 || (m === 0 && giorno < 0)));

            if (isUnder18) {
                throw new Error('L\'impiegato deve avere almeno 18 anni.');
            }
            return true;
        });

const ref_filialeValidator = (field: string) => 
  body(field)
    .isInt({ min: 1 }).withMessage('ID filiale non valido')
    .bail()
    .custom(async (value) => {
      const esiste = await Filiale.getById(value);
      if (!esiste) throw new Error('La filiale specificata non esiste');
      return true;
    });

const emailValidator = (field: string) =>
	body(field)
		.trim()
        .notEmpty().withMessage("L'email è obbligatoria")
		.isEmail().withMessage("L'email deve essere valida");

const passwordValidator = (field: string) =>
	body(field)
		.notEmpty().withMessage('La password è obbligatoria')
		.isLength({ min: 6 }).withMessage('La password deve essere lunga almeno 6 caratteri');



// Validatori
const addImpiegato = [
    nomeImpiegatoValidator('nome'),
    cognomeImpiegatoValidator('cognome'),
    ruoloValidator('ruolo'),
    fotoValidator('foto'),
    emailValidator('email'),
    data_nascitaValidator('data_nascita'),
    ref_filialeValidator('ref_filiale'),
    passwordValidator('password')
];