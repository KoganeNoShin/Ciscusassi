import { body, param, validationResult } from 'express-validator'
import { Request, Response, NextFunction } from 'express';
import OrdProd from '../Models/ord_prod';
import OrdineService from '../Services/ordineService';
import Prodotto from '../Models/prodotto';
import Ordine from '../Models/ordine';
import Prenotazione from '../Models/prenotazione';
import Cliente from '../Models/cliente';

// Parametri
const idOrdineValidator = (field: string, isPagamento: boolean = false) => {
    const deleteValidator = param(field)
        .notEmpty().withMessage("L'ID dell'ordine è obbligatorio")
        .isInt({ gt: 0 }).withMessage("L'ID dell'ordine deve essere un numero positivo")
        .bail()
        .custom(async (id) => {
            const ordine = await Ordine.getById(id);
            if (!ordine) {
                throw new Error("Ordine non esistente");
            }

            const ordProd = await OrdProd.getByOrdine(Number(id));
            if (ordProd && ordProd.length > 0) {
                throw new Error("Impossibile eliminare l'ordine: contiene prodotti associati.");
            }
            return true;
        });

    const postValidator = body(field)
        .notEmpty().withMessage("L'ID dell'ordine è obbligatorio")
        .isInt({ gt: 0 }).withMessage("L'ID dell'ordine deve essere un numero positivo")
        .bail()
        .custom(async (id_ordine) => {
            const ordine = await Ordine.getById(id_ordine);
            if (!ordine) {
                throw new Error("Ordine non esistente");
            }

            const ordProd = await OrdProd.getByOrdine(Number(id_ordine));
            if (!ordProd || ordProd.length === 0) {
                throw new Error("ID ordine senza prodotti ordinati");
            }

            if (isPagamento) {
                for (const prod of ordProd) {
                    if (prod.stato !== 'consegnato') {
                        throw new Error("L'ordine contiene prodotti non ancora consegnati.");
                    }
                }
            }
            return true;
        });

    // Middleware compatibile con Express
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.method === 'DELETE') {
            return deleteValidator(req, res, next);
        } else {
            return postValidator(req, res, next);
        }
    };
};

 const importoPagamentoValidator = (field: string) =>
    body(field)
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
        
const dataOraPagamentoValidator = (field: string) =>
    body(field)
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
        
const ref_prenotazioneValidator = (field: string) =>
    body(field)
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

const ref_clienteValidator = (field: string) =>
    body(field)
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

const username_ordinanteValidator = (field: string, ref_cliente_field = 'ref_cliente') =>
    body(field)
        .notEmpty().withMessage('Username ordinante è obbligatorio')
        .matches(/^[a-z]+\.[a-z]+\.[0-9]{4}$/i).withMessage('Formato username non valido (nome.cognome.annodinascita)')
        .bail()
        .custom(async (valore, { req }) => {
            const ref_cliente = req.body[ref_cliente_field];

            if (!ref_cliente) {
                return true;
            }

            // Estrai dati da username
            const [nome, cognome, anno] = valore.split('.');

            const utente = await Cliente.findByNumeroCarta(ref_cliente);

            if (!utente) {
                throw new Error('Utente associato al cliente non trovato');
            }

            const annoUtente = utente.data_nascita.split('-')[0];

            const nomeCorrisponde = utente.nome.toLowerCase() === nome.toLowerCase();
            const cognomeCorrisponde = utente.cognome.toLowerCase() === cognome.toLowerCase();
            const annoCorrisponde = annoUtente === anno;

            if (!nomeCorrisponde || !cognomeCorrisponde || !annoCorrisponde) {
                throw new Error('Username non corrisponde ai dati dell\'utente associato al cliente ' + valore);
            }

            return true;
        });

// Validator
const aggiungiOrdine = [
    ref_prenotazioneValidator('ref_prenotazione'),
    username_ordinanteValidator('username_ordinante'),
    ref_clienteValidator('ref_cliente')
];

const aggiungiPagamentoValidator = [
    idOrdineValidator('id_ordine', true),
    importoPagamentoValidator('pagamento_importo'),
    dataOraPagamentoValidator('data_ora_pagamento')
];


const eliminaOrdineValidator = [
    idOrdineValidator('id')
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
    aggiungiOrdine
}