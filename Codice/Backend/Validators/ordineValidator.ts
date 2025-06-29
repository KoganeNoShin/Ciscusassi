import { body, param, ValidationChain, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import OrdProd from '../Models/ord_prod';
import OrdineService from '../Services/ordineService';
import Ordine from '../Models/ordine';
import Prenotazione from '../Models/prenotazione';
import Cliente from '../Models/cliente';

// Funzioni
function idOrdineValidator(chain: ValidationChain, operazione: string): ValidationChain {
  return chain
        .notEmpty().withMessage("L'ID dell'ordine è obbligatorio")
        .isInt({ gt: 0 }).withMessage("L'ID dell'ordine deve essere un numero positivo")
        .bail()
        .toInt()
        .custom(async (id: number) => {
            const ordine = await Ordine.getById(id);
            if (!ordine) {
                throw new Error("Ordine non esistente");
            }
            
            const ordProd = await OrdProd.getByOrdine(Number(id));

            if(operazione === 'Eliminazione') {
                if (ordProd && ordProd.length > 0) {
                    throw new Error("Impossibile eliminare l'ordine: contiene prodotti associati.");
                }
            } else {
                if (!ordProd || ordProd.length === 0) {
                    throw new Error("ID ordine senza prodotti ordinati");
                }
                
                if(operazione === "Pagamento") {
                    for (const prod of ordProd) {
                        if (prod.stato !== 'consegnato') {
                            throw new Error("L'ordine contiene prodotti non ancora consegnati.");
                        }
                    }
                }
            }
            return true;
        });
}

function importoPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('L\'importo è obbligatorio')
        .isFloat({ gt: 0 }).withMessage('L\'importo deve essere un numero positivo')
        .bail()
        .custom(async (valore, { req }) => {
            const id_ordine = parseInt(req.body.id_ordine);

            if (isNaN(id_ordine)) {
                throw new Error("ID ordine non valido");
            }

            const importoMinimo = await OrdineService.calcolaImportoTotale(id_ordine);

            if (parseFloat(valore) < importoMinimo) {
                throw new Error(`L'importo non può essere inferiore a ${importoMinimo.toFixed(2)}€`);
            }

            return true;
        });
}

function dataOraPagamentoValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('La data e ora del pagamento è obbligatoria')
        .matches(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/).withMessage('La data di prenotazione deve essere nel formato "yyyy-MM-dd HH:mm"')
        .custom((value) => {
            const data = new Date(value);
            const now = new Date();

            if (data > now) {
                throw new Error('La data e ora del pagamento non può essere nel futuro.');
            }

            return true;
        });
 }
       
function ref_prenotazioneValidator(chain: ValidationChain): ValidationChain {
  return chain
        .notEmpty().withMessage('Il riferimento alla prenotazione è obbligatorio')
        .isInt({ gt: 0 }).withMessage('L\'ID dell\'ordine deve essere un numero positivo')
        .bail()
        .custom(async (valore, { req }) => {
            const prenotazione = await Prenotazione.getById(valore);
            if(prenotazione == null) {
                throw new Error("Prenotazioe non trovata")
            }
            return true;
        });
}

function ref_clienteValidator(chain: ValidationChain): ValidationChain {
  return chain
        .optional({ nullable: true })
        .isInt({ gt: 0 }).withMessage('L\'ID cliente, se presente, deve essere un numero positivo')
        .bail()
        .custom(async (valore) => {
            if (valore == null) return true;

            const cliente = await Cliente.findByNumeroCarta(valore);
            if (!cliente) {
                throw new Error('Cliente non trovato');
            }
            return true;
        });
}

function username_ordinanteValidator(chain: ValidationChain): ValidationChain {
  return chain
        .trim()
        .notEmpty().withMessage('Username ordinante è obbligatorio')
        .matches(/^[a-z]+\.[a-z]+\.[0-9]{4}$/i).withMessage('Formato username non valido (nome.cognome.annodinascita)')
}

// Validator
const aggiungiOrdine = [
    ref_prenotazioneValidator(body('ref_prenotazione')),
    ref_clienteValidator(body('ref_cliente')),
    username_ordinanteValidator(body('username_ordinante')),
];

const aggiungiPagamentoValidator = [
    idOrdineValidator(body('id_ordine'), 'Pagamento'),
    importoPagamentoValidator(body('pagamento_importo')),
    dataOraPagamentoValidator(body('data_ora_pagamento'))
];


const eliminaOrdineValidator = [
    idOrdineValidator(body('id_ordine'), 'Eliminazione'),
];

const getIDOrdineByPrenotazioneAndUsername = [
    ref_prenotazioneValidator(param('id_prenotazione')),
    username_ordinanteValidator(param('username'))
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
    aggiungiPagamentoValidator,
    eliminaOrdineValidator,
    aggiungiOrdine,
    getIDOrdineByPrenotazioneAndUsername
}