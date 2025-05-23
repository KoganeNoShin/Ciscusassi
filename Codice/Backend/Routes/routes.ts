import express from 'express';

import ClienteController from '../Controllers/clienteController';

import AuthValidator from '../Validators/authValidator';
import ProdottoController from '../Controllers/prodottoController';
import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';

const router = express.Router();

// Route per i Prodotti
router.get('/piattoDelGiorno', ProdottoController.getprodottoDelGiorno);
router.get('/prodotti', ProdottoController.getAllProdotti);
router.post('addProdotto', ProdottoController.addProdotto);
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

router.get('/impiegati', ImpiegatoController.getAllImpiegati);

// Registrazione
//router.post('/register', AuthValidator.registerValidator, AuthValidator.validate, ClienteController.register);

// Login
router.post(
	'/login',
	AuthValidator.loginValidator,
	AuthValidator.validate,
	ClienteController.login
);

// Logout
//router.post('/logout', ClienteController.logout);

export default router;
