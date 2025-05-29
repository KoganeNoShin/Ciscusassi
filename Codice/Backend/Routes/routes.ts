import express from 'express';

import ClienteController from '../Controllers/clienteController';

import AuthValidator from '../Validators/authValidator';
import ProdottoController from '../Controllers/prodottoController';
import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';
import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';
import AuthController from '../Controllers/authController';
import AsportoController from '../Controllers/asportoController';
import PagamentoController from '../Controllers/pagamentoController';
import asportoValidator from '../Validators/asportoValidator';
import prodottoValidator from '../Validators/prodottoValidator';

const router = express.Router();

// Route per Asporto
router.post('/addAsporto',
	asportoValidator.addAsportoValidator,
	asportoValidator.validate,
	authMiddleware,
	AsportoController.addAsporto);

// Route per le Filiali
router.get('/filiali', FilialeController.getAllFiliali);
router.post('/addFiliale', 
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.addFiliale);
router.put('/updateFiliale/:id',
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.updateFiliale);
router.delete('/deleteFiliale/:id',
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.deleteFiliale);

// Route per i Impiegati
router.post('/addImpiegato',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.addImpiegato);
router.put('/updateImpiegato/:matricola',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.updateImpiegato);
router.delete('/deleteImpiegato/:matricola',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.deleteImpiegato);
router.get('/impiegati/:id',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.getAllImpiegati);

// Route per i Pagamenti
router.get('/pagamenti/:year', 
	authMiddleware,
	roleMiddleware(['amministratore']),
	PagamentoController.getPagamentiByYear);

// Route per i Prodotti
router.get('/piattoDelGiorno', ProdottoController.getProdottoDelGiorno);
router.get('/prodotti', ProdottoController.getAllProdotti);
router.post('/addProdotto',
	prodottoValidator.addProdottoValidator,
	prodottoValidator.validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ProdottoController.addProdotto);
router.put('/updateProdotto/:id',
	prodottoValidator.addProdottoValidator,
	prodottoValidator.validate,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ProdottoController.updateProdotto);
router.delete('/deleteProdotto/:id',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ProdottoController.deleteProdotto);
router.put('/chargePiattoDelGiorno/:id',
	authMiddleware,
	roleMiddleware(['amministratore']),
	ProdottoController.chargePiattoDelGiorno
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
router.post(
	'/login',
	AuthValidator.loginValidator,
	AuthValidator.validate,
	AuthController.login
);

router.get('/logout', authMiddleware, AuthController.logout);

router.get('/points', authMiddleware, ClienteController.getPoints);

// Logout
//router.post('/logout', ClienteController.logout);

export default router;
