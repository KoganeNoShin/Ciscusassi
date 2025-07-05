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
} from '../Validators/prenotazioneValidator';

import { numeroCartaValidator } from '../Validators/clienteValidator';

// ----- Controller -----

import OrdProdController from '../Controllers/ordprodController';
import OrdineController from '../Controllers/ordineController';
import PrenotazioneController from '../Controllers/prenotazioneController';

const router = Router();

// ----- Rotte -----

// Route per i Prenotazioni
router.get('',authMiddleware,roleMiddleware(['amministratore']) , PrenotazioneController.getAllPrenotazioni); //  ✅

router.get(
	'/:id_prenotazione', // ✅
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getPrenotazioneById
);

router.get(
	'/cameriere/:id_cliente',
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	numeroCartaValidator(param('id_cliente')),
	validateMiddleware,
	PrenotazioneController.getPrenotazioniByCliente
);

router.get(
	'/filiale/prenotazioni',
	authMiddleware,
	roleMiddleware(['amministratore', 'chef', 'cameriere']),
	validateMiddleware,
	PrenotazioneController.getPrenotazioniDelGiornoFiliale
);

router.get(
	'/filiale/tavoli-in-uso',
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.getTavoliInUso
);

router.post(
	'/check-otp',
	checkOTPValidator,
	validateMiddleware,
	PrenotazioneController.checkOTP
);

router.get(
	'/:id_prenotazione/cameriere/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getStatoPrenotazioneCameriere
);

router.get(
	'/:id_prenotazione/chef/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	PrenotazioneController.getStatoPrenotazioneChef
);

router.post(
	'/prenota',
	prenotazioneInputValidator,
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.prenota
);

router.post(
	'/prenotaLoco',
	prenotazioneInputLocoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.prenotaLoco
);

router.put(
	'/modificaPrenotazione',
	prenotazioneInputValidator,
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.modificaPrenotazione
);

router.delete(
	'/eliminaPrenotazione/:id_prenotazione',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	authMiddleware,
	PrenotazioneController.eliminaPrenotazione
);

router.post(
	'/conferma',
	idPrenotazioneValidator(body('id_prenotazione')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.confermaPrenotazione
);

// Rotte per gli ordini

router.post(
	'/addOrdine',
	authMiddleware,
	validateMiddleware,
	OrdineController.addOrdine
);

router.post(
	'/ordine/pay',
	addPagamentoValidator,
	validateMiddleware,
	OrdineController.addPagamento
);

router.get(
	'/ordine/:idOrdine/totale',
	idOrdineValidator(param('idOrdine'), 'Pagamento'),
	validateMiddleware,
	OrdineController.calcolaImportoTotale
);

router.get(
	'/:id_prenotazione/ordini/:username',
	getIDOrdineByPrenotazioneAndUsername,
	validateMiddleware,
	OrdineController.getOrdineByPrenotazioneAndUsername
);

// Route per OrdProd
router.post(
	'/ordine/addProdotti',
	ordProdArrayValidator,
	validateMiddleware,
	OrdProdController.addProdottiOrdine
);

router.get(
	'/ordine/:id_ordine/prodotti/',
	authMiddleware,
	idOrdineValidator(param('id_ordine'), 'EsistenzaOrdine'),
	validateMiddleware,
	OrdProdController.getProdottiByOrdine
);

router.get(
	'/:id_prenotazione/prodotti',
	idPrenotazioneValidator(param('id_prenotazione')),
	validateMiddleware,
	OrdProdController.getProdottiByPrenotazione
);

router.put(
	'/ordine/prodotto/:id_ordprod/cambiaStato',
	authMiddleware,
	roleMiddleware(['amministratore', 'chef', 'cameriere']),
	cambiaStatoProdottoValidator,
	validateMiddleware,
	OrdProdController.cambiaStatoProdottoOrdine
);

router.put(
	'/ordine/prodotto/:id_ordprod/isRomana',
	CambioRomanaValidator,
	validateMiddleware,
	OrdProdController.aggiornaStatoRomana
);

export default router;
