import { Router } from 'express';
import { param, body } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';

// ----- Validatori -----

import {
	addPagamentoValidator,
	getIDOrdineByPrenotazioneAndUsername,
	idOrdineValidator,
} from '../Validators/ordineValidator';

import {
	cambiaStatoProdottoValidator,
	CambioRomanaValidator,
	ordProdArrayValidator,
} from '../Validators/ordprodValidator';

import {
	checkOTPValidator,
	idPrenotazioneValidator,
	prenotazioneInputLocoValidator,
	prenotazioneInputValidator,
	prenotazioneUpdateValidator,
} from '../Validators/prenotazioneValidator';

import { numeroCartaValidator } from '../Validators/clienteValidator';

// ----- Controller -----

import OrdProdController from '../Controllers/ordprodController';
import OrdineController from '../Controllers/ordineController';
import PrenotazioneController from '../Controllers/prenotazioneController';

const router = Router();

// ----- Rotte -----

/**
 * @route GET /
 * @description Restituisce tutte le prenotazioni nel sistema.
 * @access Amministratore (auth + ruolo)
 */
router.get('', authMiddleware, roleMiddleware(['amministratore']), PrenotazioneController.getAllPrenotazioni);

/**
 * @route GET /:id_prenotazione
 * @description Restituisce una prenotazione specifica dato l'ID.
 * @access Pubblico
 */
router.get(
	'/:id_prenotazione',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getPrenotazioneById
);

/**
 * @route GET /cameriere/:id_cliente
 * @description Restituisce tutte le prenotazioni effettuate da un cliente.
 * @access Cameriere, Amministratore
 */
router.get(
	'/cameriere/:id_cliente',
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	numeroCartaValidator(param('id_cliente')),
	validateMiddleware,
	PrenotazioneController.getPrenotazioniByCliente
);

/**
 * @route GET /filiale/prenotazioni
 * @description Ritorna tutte le prenotazioni del giorno per la filiale dell’utente.
 * @access Amministratore, Chef, Cameriere
 */
router.get(
	'/filiale/prenotazioni',
	authMiddleware,
	roleMiddleware(['amministratore', 'chef', 'cameriere']),
	validateMiddleware,
	PrenotazioneController.getPrenotazioniDelGiornoFiliale
);

/**
 * @route GET /filiale/tavoli-in-uso
 * @description Elenca i tavoli attualmente occupati nella filiale.
 * @access Autenticato
 */
router.get(
	'/filiale/tavoli-in-uso',
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.getTavoliInUso
);

/**
 * @route POST /check-otp
 * @description Verifica la validità di un codice OTP fornito.
 * @access Pubblico
 */
router.post(
	'/check-otp',
	checkOTPValidator,
	validateMiddleware,
	PrenotazioneController.checkOTP
);

/**
 * @route GET /:id_prenotazione/cameriere/stato
 * @description Restituisce lo stato della prenotazione per il cameriere.
 * @access Pubblico
 */
router.get(
	'/:id_prenotazione/cameriere/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getStatoPrenotazioneCameriere
);

/**
 * @route GET /:id_prenotazione/chef/stato
 * @description Restituisce lo stato della prenotazione per lo chef.
 * @access Pubblico
 */
router.get(
	'/:id_prenotazione/chef/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getStatoPrenotazioneChef
);

/**
 * @route POST /prenota
 * @description Inserisce una nuova prenotazione.
 * @access Cliente autenticato
 */
router.post(
	'/prenota',
	prenotazioneInputValidator,
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.prenota
);

/**
 * @route POST /prenotaLoco
 * @description Inserisce una prenotazione in loco.
 * @access Cameriere, Amministratore
 */
router.post(
	'/prenotaLoco',
	prenotazioneInputLocoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.prenotaLoco
);

/**
 * @route PUT /modificaPrenotazione
 * @description Modifica una prenotazione esistente.
 * @access Cliente autenticato
 */
router.put(
	'/modificaPrenotazione',
	prenotazioneUpdateValidator,
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.modificaPrenotazione
);

/**
 * @route DELETE /eliminaPrenotazione/:id_prenotazione
 * @description Elimina una prenotazione esistente.
 * @access Cliente autenticato
 */
router.delete(
	'/eliminaPrenotazione/:id_prenotazione',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.eliminaPrenotazione
);

/**
 * @route POST /conferma
 * @description Conferma una prenotazione.
 * @access Cameriere, Amministratore
 */
router.post(
	'/conferma',
	idPrenotazioneValidator(body('id_prenotazione')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.confermaPrenotazione
);

/**
 * @route POST /addOrdine
 * @description Crea un ordine vuoto associato a una prenotazione.
 * @access Cliente autenticato
 */
router.post(
	'/addOrdine',
	authMiddleware,
	validateMiddleware,
	OrdineController.addOrdine
);

/**
 * @route POST /ordine/pay
 * @description Aggiunge un pagamento a un ordine.
 * @access Cliente autenticato
 */
router.post(
	'/ordine/pay',
	addPagamentoValidator,
	validateMiddleware,
	OrdineController.addPagamento
);

/**
 * @route GET /ordine/:idOrdine/totale
 * @description Calcola l’importo totale da pagare per l’ordine.
 * @access Pubblico
 */
router.get(
	'/ordine/:idOrdine/totale',
	idOrdineValidator(param('idOrdine'), 'Pagamento'),
	validateMiddleware,
	OrdineController.calcolaImportoTotale
);

/**
 * @route GET /:id_prenotazione/ordini/:username
 * @description Ottiene l’ordine di un utente specifico per una prenotazione.
 * @access Pubblico
 */
router.get(
	'/:id_prenotazione/ordini/:username',
	getIDOrdineByPrenotazioneAndUsername,
	validateMiddleware,
	OrdineController.getOrdineByPrenotazioneAndUsername
);

/**
 * @route POST /ordine/addProdotti
 * @description Aggiunge più prodotti a un ordine esistente.
 * @access Cliente autenticato
 */
router.post(
	'/ordine/addProdotti',
	ordProdArrayValidator,
	validateMiddleware,
	OrdProdController.addProdottiOrdine
);

/**
 * @route GET /ordine/:id_ordine/prodotti/
 * @description Ottiene tutti i prodotti di un ordine.
 * @access Autenticato
 */
router.get(
	'/ordine/:id_ordine/prodotti/',
	authMiddleware,
	idOrdineValidator(param('id_ordine'), 'EsistenzaOrdine'),
	validateMiddleware,
	OrdProdController.getProdottiByOrdine
);

/**
 * @route GET /:id_prenotazione/prodotti
 * @description Restituisce tutti i prodotti associati a una prenotazione.
 * @access Pubblico
 */
router.get(
	'/:id_prenotazione/prodotti',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	OrdProdController.getProdottiByPrenotazione
);

/**
 * @route PUT /ordine/prodotto/:id_ordprod/cambiaStato
 * @description Modifica lo stato di preparazione di un prodotto ordinato.
 * @access Amministratore, Chef, Cameriere
 */
router.put(
	'/ordine/prodotto/:id_ordprod/cambiaStato',
	authMiddleware,
	roleMiddleware(['amministratore', 'chef', 'cameriere']),
	cambiaStatoProdottoValidator,
	validateMiddleware,
	OrdProdController.cambiaStatoProdottoOrdine
);

/**
 * @route PUT /ordine/prodotto/:id_ordprod/isRomana
 * @description Imposta se una pizza è "Romana" per un prodotto ordinato.
 * @access Pubblico
 */
router.put(
	'/ordine/prodotto/:id_ordprod/isRomana',
	CambioRomanaValidator,
	validateMiddleware,
	OrdProdController.aggiornaStatoRomana
);

export default router;