import express from 'express';

import ClienteController from '../Controllers/clienteController';

import AuthValidator from '../Validators/authValidator';

const router = express.Router();

// Registrazione
router.post('/register', AuthValidator.registerValidator, AuthValidator.validate, ClienteController.register);

// Login
router.post('/login', AuthValidator.loginValidator, AuthValidator.validate, ClienteController.login);

// Logout
router.post('/logout', ClienteController.logout);

export default router;