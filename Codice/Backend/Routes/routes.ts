import express, { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';

import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';
import ClienteController from '../Controllers/clienteController';
import ProdottoController from '../Controllers/prodottoController';
import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';
import AuthController from '../Controllers/authController';
import AsportoController from '../Controllers/asportoController';
import PagamentoController from '../Controllers/pagamentoController';
import PrenotazioneController from '../Controllers/prenotazioneController';
import OrdProdController from '../Controllers/ordprodController';
import TorrettaController from '../Controllers/torrettaController';
import OrdineController from '../Controllers/ordineController';
import { addAsportoValidator } from '../Validators/asportoValidator';
import {
	addFilialeValidator,
	idFilialeValidator,
	updateFilialeValidator,
} from '../Validators/filialeValidator';
import {
	addOrdineValidator,
	addPagamentoValidator,
	getIDOrdineByPrenotazioneAndUsername,
	idOrdineValidator,
} from '../Validators/ordineValidator';
import {
	cambiaStatoProdottoValidator,
	CambioRomanaValidator,
	ordProdArrayValidator,
} from '../Validators/ordprodValidator';
import { annoPagamentoValidator } from '../Validators/pagamentoValidator';
import {
	addProdottoValidator,
	idProdottoValidator,
	updateProdottoValidator,
} from '../Validators/prodottoValidator';
import {
	checkOTPValidator,
	idPrenotazioneValidator,
	prenotazioneInputLocoValidator,
	prenotazioneInputValidator,
	prenotazioneUpdateValidator,
} from '../Validators/prenotazioneValidator';
import { idTorrettaValidator } from '../Validators/torrettaValidator';
import { loginValidator } from '../Validators/authValidator';
import {
	addImpiegatoValidator,
	matricolaImpiegatoValidator,
	updateImpiegatoValidator,
} from '../Validators/impiegatoValidator';

const router = express.Router();

export const validate = (req: Request, res: Response, next: NextFunction): void => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		res.status(400).json({ errors: errors.array() });
		return;
	}
	next();
};

// Route per Asporto
router.post(
	'/addAsporto',
	addAsportoValidator,
	validate,
	authMiddleware,
	AsportoController.addAsporto
);

// Route per le Filiali
router.get('/filiali', FilialeController.getAllFiliali);

router.post(
	'/addFiliale',
	updateFilialeValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.addFiliale
);

router.put(
	'/updateFiliale/:id_filiale',
	addFilialeValidator,
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
	'/filiale/id_filiale/impiegati',
	idFilialeValidator(param('id_filiale')),
	validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.getAllImpiegati
);

// Route per Ordine
router.post(
	'/prenotazione/addOrdine',
	addOrdineValidator,
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
	OrdineController.getIDOrdineByPrenotazioneAndUsername
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
	validate,
	PagamentoController.getPagamentiByYear
);

// Route per i Prodotti
router.get('/menu/piattoDelGiorno', ProdottoController.getProdottoDelGiorno);

router.get('/menu', ProdottoController.getAllProdotti);

router.post(
	'/menu/addProdotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	addProdottoValidator,
	validate,
	ProdottoController.addProdotto
);

router.put(
	'/menu/updateProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	updateProdottoValidator,
	validate,
	ProdottoController.updateProdotto
);

router.delete(
	'/menu/deleteProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validate,
	ProdottoController.deleteProdotto
);

router.put(
	'/menu/changePiattoDelGiorno/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validate,
	ProdottoController.changePiattoDelGiorno
);

// Route per i Prenotazioni
router.get('/prenotazioni', PrenotazioneController.getAllPrenotazioni);

router.get(
	'/prenotazione/:id_prenotazione',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	PrenotazioneController.getPrenotazioneById
);

router.get(
	'/prenotazioni/cliente/:id_cliente',
	authMiddleware,
	validate,
	PrenotazioneController.getPrenotazioniByCliente
);

router.get(
	'/filiale/:id_filiale/prenotazioni',
	authMiddleware,
	idFilialeValidator(param('id_filiale')),
	validate,
	PrenotazioneController.getPrenotazioniDelGiornoFiliale
);

router.get(
	'/filiale/:id_filiale/tavoli-in-uso',
	idFilialeValidator(param('id_filiale')),
	validate,
	authMiddleware,
	PrenotazioneController.getTavoliInUso
);

router.get(
	'/prenotazione/:id_prenotazione/otp',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	PrenotazioneController.getOTPById
);

router.post(
	'/prenotazione/check-otp',
	checkOTPValidator,
	validate,
	PrenotazioneController.checkOTP
);

router.get(
	'/prenotazione/:id_prenotazione/cameriere/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	PrenotazioneController.getStatoPrenotazioneCameriere
);

router.get(
	'/prenotazione/:id_prenotazione/chef/stato',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	PrenotazioneController.getStatoPrenotazioneChef
);

router.post(
	'/prenota',
	prenotazioneInputValidator,
	validate,
	authMiddleware,
	PrenotazioneController.prenota
);

router.post(
	'/prenotaLoco',
	prenotazioneInputLocoValidator,
	validate,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.prenotaLoco
);

router.put(
	'/modificaPrenotazione',
	prenotazioneUpdateValidator,
	validate,
	authMiddleware,
	PrenotazioneController.modificaPrenotazione
);

router.delete(
	'/eliminaPrenotazione/:id_prenotazione',
	idPrenotazioneValidator(param('id_prenotazione')),
	validate,
	authMiddleware,
	PrenotazioneController.eliminaPrenotazione
);

router.post(
	'/prenotazione/conferma',
	idPrenotazioneValidator(body('id_prenotazione')),
	validate,
	authMiddleware,
	roleMiddleware(['amministratore', 'cameriere']),
	PrenotazioneController.confermaPrenotazione
);

// Route per le torrette
router.get(
	'/torrette/:id_torretta',
	idTorrettaValidator(param('id_torretta')),
	validate,
	TorrettaController.getTorrettaByID
);

/* ESEMPIO DI COME PROTEGGERE LE ROTTE 
router.post(
	'/testAuth',
	authMiddleware, // Si può mettere anche da solo per verificare solo che l'utente è autenticato
	roleMiddleware(['chef']), // Messo per verificare uno specifico ruolo tra i possibili: chef, amministratore, cameriere
	ProdottoController.getprodottoDelGiorno
);
 */

// Registrazione
//router.post('/register', AuthValidator.registerValidator, AuthValidator.validate, ClienteController.register);

// Login
router.post('/login', loginValidator, validate, AuthController.login);

router.get('/logout', authMiddleware, AuthController.logout);

router.get('/points', authMiddleware, ClienteController.getPoints);

// Logout
//router.post('/logout', ClienteController.logout);

export default router;
