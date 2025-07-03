import express from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';
import validateMiddleware from '../Middleware/validateMiddleware';

// ----- Validatori -----

import { addAsportoValidator } from '../Validators/asportoValidator';
import { annoPagamentoValidator } from '../Validators/pagamentoValidator';
import { idTorrettaValidator } from '../Validators/torrettaValidator';

// ----- Controller -----

import AsportoController from '../Controllers/asportoController';
import PagamentoController from '../Controllers/pagamentoController';
import TorrettaController from '../Controllers/torrettaController';

// ----- Rotte esterne -----

import rotteAutenticazione from './rotteAutenticazione';
import rotteClienti from './rotteClienti';
import rotteFiliali from './rotteFiliali';
import rotteMenu from './rotteMenu';
import rottePrenotazioni from './rottePrenotazioni';

const router = express.Router();

// ----- Rotte con prefissi -----

router.use('/auth', rotteAutenticazione);
router.use('/clienti', rotteClienti); // tutte le rotte che iniziano con '/clienti'
router.use('/filiali', rotteFiliali); // tutte le rotte che iniziano con '/filiali'
router.use('/menu', rotteMenu); // tutte le rotte che iniziano con '/menu'
router.use('/prenotazioni', rottePrenotazioni); // tutte le rotte che iniziano con '/prenotazioni'

// ----- Rotte senza prefissi -----

router.post(
	'/addAsporto',
	addAsportoValidator,
	validateMiddleware,
	authMiddleware,
	AsportoController.addAsporto
);

// Route per Clienti

router.put(
	'/cliente/updateDati',
	authMiddleware,
	updateClienteValidator,
	validate,
	ClienteController.aggiornaDatiPersonali);

router.post(
	'/cliente/nuova_password',
	authMiddleware,
	aggiornaPasswordValidator,
	validate,
	ClienteController.aggiornaPassword
);

router.post(
	'/cliente/nuova_email',
	authMiddleware,
	emailClienteValidator(body('nuovaEmail')),
	validate,
	ClienteController.aggiornaEmail
);

// Route per le Filiali
router.get('/filiali', FilialeController.getAllFiliali);

router.post(
	'/addFiliale',
	addFilialeValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.addFiliale
);

router.put(
	'/updateFiliale/:id_filiale',
	updateFilialeValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.updateFiliale
);

router.delete(
	'/deleteFiliale/:id_filiale',
	idFilialeValidator(param('id_filiale')),
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.deleteFiliale
);

// Route per i Impiegati
router.post(
	'/filiale/addImpiegato',
	addImpiegatoValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.addImpiegato
);

router.put(
	'/filiale/updateImpiegato/:matricola',
	updateImpiegatoValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.updateImpiegato
);

router.delete(
	'/filiale/deleteImpiegato/:matricola',
	matricolaImpiegatoValidator(param('matricola')),
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.deleteImpiegato
);

router.get(
	'/filiale/:id_filiale/impiegati',
	idFilialeValidator(param('id_filiale')),
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.getAllImpiegati
);

// Route per Ordine
router.post(
	'/prenotazione/addOrdine',
	authMiddleware,
	validate,
	OrdineController.addOrdine
);

router.post(
	'/prenotazione/ordine/pay',
	addPagamentoValidator,
	validate,
	OrdineController.addPagamento
);

router.get(
	'/prenotazione/ordine/:idOrdine/totale',
	idOrdineValidator(param('idOrdine'), 'Pagamento'),
	validate,
	OrdineController.calcolaImportoTotale
);

router.get(
	'/prenotazione/:id_prenotazione/ordini/:username',
	getIDOrdineByPrenotazioneAndUsername,
	validate,
	OrdineController.getOrdineByPrenotazioneAndUsername
);

// Route per OrdProd
router.post(
	'/prenotazione/ordine/addProdotti',
	ordProdArrayValidator,
	validate,
	OrdProdController.addProdottiOrdine
);

router.get(
	'/prenotazione/ordine/:id_ordine/prodotti/',
	authMiddleware,
	idOrdineValidator(param('id_ordine'), 'EsistenzaOrdine'),
	validate,
	OrdProdController.getProdottiByOrdine
);

router.get(
	'/prenotazione/:id_prenotazione/prodotti',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	OrdProdController.getProdottiByPrenotazione
);

router.put(
	'/prenotazione/ordine/prodotto/:id_ordprod/cambiaStato',
	authMiddleware,
	roleMiddleware(['amministratore', 'chef', 'cameriere']),
	cambiaStatoProdottoValidator,
	validate,
	OrdProdController.cambiaStatoProdottoOrdine
);

router.put(
	'/prenotazione/ordine/prodotto/:id_ordprod/isRomana',
	CambioRomanaValidator,
	validate,
	OrdProdController.aggiornaStatoRomana
);

// Route per i Pagamenti
router.get(
	'/pagamenti/:year',
	authMiddleware,
	roleMiddleware(['amministratore']),
	annoPagamentoValidator(param('year')),
	validateMiddleware,
	PagamentoController.getPagamentiByYear
);

router.get(
	'/torrette/:id_torretta',
	idTorrettaValidator(param('id_torretta')),
	validateMiddleware,
	TorrettaController.getTorrettaByID
);

export default router;
