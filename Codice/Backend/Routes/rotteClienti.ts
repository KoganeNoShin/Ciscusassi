import { Router } from 'express';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';

// ----- Validatori -----

import {
	addClienteValidator,
	aggiornaPasswordValidator,
	emailClienteValidator,
	updateClienteValidator,
} from '../Validators/clienteValidator';

// ----- Controller -----

import ClienteController from '../Controllers/clienteController';
import { body } from 'express-validator';

const router = Router();

// ----- Rotte -----

router.post(
	'/register',
	addClienteValidator,
	validateMiddleware,
	ClienteController.register
);

router.get('/points', authMiddleware, ClienteController.getPuntiCliente);

router.put(
	'/updateDati',
	authMiddleware,
	updateClienteValidator,
	validateMiddleware,
	ClienteController.aggiornaDatiPersonali
);

router.post(
	'/cliente/nuova_password',
	authMiddleware,
	aggiornaPasswordValidator,
	validateMiddleware,
	ClienteController.aggiornaPassword
);

router.post(
	'/cliente/nuova_email',
	authMiddleware,
	emailClienteValidator(body('nuovaEmail')),
	validateMiddleware,
	ClienteController.aggiornaEmail
);


export default router;
