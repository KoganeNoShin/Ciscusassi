import express from 'express';

import ClienteController from '../Controllers/clienteController';

import AuthValidator from '../Validators/authValidator';
import ProdottoController from '../Controllers/prodottoController';
import FilialeController from '../Controllers/filialeController';

const router = express.Router();

router.get('/piattoDelGiorno', ProdottoController.getprodottoDelGiorno);
router.get('/prodotti', ProdottoController.getAllProdotti);

router.get('/filiali', FilialeController.getAllFiliali);

// Registrazione
//router.post('/register', AuthValidator.registerValidator, AuthValidator.validate, ClienteController.register);

// Login
//router.post('/login', AuthValidator.loginValidator, AuthValidator.validate, ClienteController.login);

// Logout
//router.post('/logout', ClienteController.logout);

export default router;
