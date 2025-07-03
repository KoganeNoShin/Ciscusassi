import { Router } from 'express';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';

// ----- Validatori -----

import {
	addClienteValidator,
	aggiornaPasswordValidator,
	updateClienteValidator,
} from '../Validators/clienteValidator';

// ----- Controller -----

import ClienteController from '../Controllers/clienteController';

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

router.put(
	'/nuova_password',
	authMiddleware,
	aggiornaPasswordValidator,
	validateMiddleware,
	ClienteController.aggiornaPassword
);

export default router;
