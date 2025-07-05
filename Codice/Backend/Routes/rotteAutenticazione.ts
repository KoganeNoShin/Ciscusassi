import { Router } from 'express';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware'; // Gestisce e restituisce eventuali errori di validazione
import authMiddleware from '../Middleware/authMiddleware'; // Verifica l'autenticazione tramite token

// ----- Validatori -----

import { emailValidator, loginValidator } from '../Validators/authValidator'; // Validatori per email e credenziali login

// ----- Controller -----

import AuthController from '../Controllers/authController'; // Controller che gestisce le logiche di autenticazione
import { body } from 'express-validator';

const router = Router();

// ----- Rotte di autenticazione -----

/**
 * @route POST /auth/login
 * @desc Autentica un utente e restituisce un token JWT
 * @access Pubblico
 * @middleware `loginValidator`, `validateMiddleware`
 */
router.post(
	'/login',
	loginValidator,
	validateMiddleware,
	AuthController.login
);

/**
 * @route GET /auth/logout
 * @desc Invalida il token dell'utente corrente (se implementata una blacklist o gestione token lato client)
 * @access Privato (richiede autenticazione)
 * @middleware `authMiddleware`
 */
router.get(
	'/logout',
	authMiddleware,
	AuthController.logout
);

/**
 * @route POST /auth/recupera_password
 * @desc Invia una mail con le istruzioni per il recupero della password
 * @access Pubblico
 * @middleware `emailValidator`, `validateMiddleware`
 */
router.post(
	'/recupera_password',
	emailValidator(body('email')),
	validateMiddleware,
	AuthController.recuperaPassword
);

export default router;