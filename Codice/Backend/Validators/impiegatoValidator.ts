import { body, ValidationChain } from 'express-validator'
import { idFilialeValidator } from './filialeValidator';

// Funzioni
function nomeImpiegatoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Il nome dell\'impiegato è obbligatorio');
}

function cognomeImpiegatoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Il cognome dell\'impiegato è obbligatorio');
}

function ruoloValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Il ruolo dell\'impiegato è obbligatorio')
        .custom((value: string) => {
            const ruoliAmmessi = ['Amministratore', 'Chef', 'Cameriere'];
            if (!ruoliAmmessi.includes(value)) {
                throw new Error(`Il ruolo "${value}" non è valido. Ruoli ammessi: ${ruoliAmmessi.join(', ')}.`);
            }
            return true;
        });
}

function fotoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'immagine è obbligatoria!')
        .isBase64().withMessage('Formato immagine non valido!');
}

function data_nascitaValidator(chain: ValidationChain): ValidationChain {
  return chain
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
}

function emailValidator(chain: ValidationChain): ValidationChain {
  return chain
		.trim()
    .notEmpty().withMessage("L'email è obbligatoria")
		.isEmail().withMessage("L'email deve essere valida");
}

function passwordValidator(chain: ValidationChain): ValidationChain {
  return chain
		.notEmpty().withMessage('La password è obbligatoria')
		.isLength({ min: 6 }).withMessage('La password deve essere lunga almeno 6 caratteri');
}

// Validatori

const addImpiegato = [
    nomeImpiegatoValidator(body('nome')),
    cognomeImpiegatoValidator(body('cognome')),
    ruoloValidator(body('ruolo')),
    fotoValidator(body('foto')),
    emailValidator(body('email')),
    data_nascitaValidator(body('data_nascita')),
    idFilialeValidator(body('ref_filiale')),
    passwordValidator(body('password'))
];

