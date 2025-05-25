import express from 'express';

import ClienteController from '../Controllers/clienteController';

import AuthValidator from '../Validators/authValidator';
import ProdottoController from '../Controllers/prodottoController';
import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';
import OrdineController from '../Controllers/ordineController';
import OrdineProdottoController from '../Controllers/ord_prodController';
import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';
import AuthController from '../Controllers/authController';
import AsportoController from '../Controllers/asportoController';

const router = express.Router();

// Route per i Prodotti
router.get('/piattoDelGiorno', ProdottoController.getProdottoDelGiorno);
router.get('/prodotti', ProdottoController.getAllProdotti);
router.post('/addProdotto', ProdottoController.addProdotto);
router.put('/updateProdotto/:id', ProdottoController.updateProdotto);
router.delete('/deleteProdotto/:id', ProdottoController.deleteProdotto);
router.put(
	'/chargePiattoDelGiorno/:id',
	ProdottoController.chargePiattoDelGiorno
);

// Route per le Filiali
router.get('/filiali', FilialeController.getAllFiliali);
router.post('/addFiliale', FilialeController.addFiliale);
router.put('/updateFiliale/:id', FilialeController.updateFiliale);
router.delete('/deleteFiliale/:id', FilialeController.deleteFiliale);

// Route per gli Ordini
router.get('/ordini', OrdineController.getAllOrdini);
router.get('/ordine/:id', OrdineController.getOrdineById);
router.post('/addOrdine', OrdineController.addOrdine);
router.put('/updateOrdine/:id', OrdineController.updateOrdine);
router.delete('/deleteOrdine/:id', OrdineController.deleteOrdine);

// Route per gli Ordini e Prodotti
router.get('/ordiniProdotti', OrdineProdottoController.getAllOrdini);
router.get('/ordiniProdotti/:id', OrdineProdottoController.getById);
router.get(
	'/ordiniProdotti/ref_ordine/:ref_ordine',
	OrdineProdottoController.getByRefOrdine
);
router.post('/addOrdineProdotto', OrdineProdottoController.addOrdineProdotto);
router.put(
	'/deleteOrdineProdotto/:id',
	OrdineProdottoController.deleteOrdineProdotto
);
router.put('/romana/:id', OrdineProdottoController.cambiaRomana);
router.put('/cambiaStato/:id', OrdineProdottoController.cambioStato);

// Route per Asporto
router.post('/addAsporto', AsportoController.addAsporto);

router.get('/impiegati', ImpiegatoController.getAllImpiegati);

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

router.post('/logout', authMiddleware, AuthController.logout);

router.get('/points', authMiddleware, ClienteController.getPoints);

// Logout
//router.post('/logout', ClienteController.logout);

export default router;
