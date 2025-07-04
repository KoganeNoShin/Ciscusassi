import { Router } from 'express';
import { body } from 'express-validator';

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

const router = Router();

// ----- Rotte -----

router.post(
	'/register', // ✅
	addClienteValidator,
	validateMiddleware,
	ClienteController.register
);

router.get('/points', authMiddleware, ClienteController.getPuntiCliente); // ✅

router.put(
	'/updateDati', // ❓ Non so da dove fare partire il richiamo nell' app
	authMiddleware,
	updateClienteValidator,
	validateMiddleware,
	ClienteController.aggiornaDatiPersonali
);

router.put(
	'/nuova_password', // ✅
	authMiddleware,
	aggiornaPasswordValidator,
	validateMiddleware,
	ClienteController.aggiornaPassword
);

router.put(
	'/nuova_email', // ✅
	authMiddleware,
	emailClienteValidator(body('nuovaEmail')),
	validateMiddleware,
	ClienteController.aggiornaEmail
);

// ❌ TODO:
// 			- 	Implementare gestione errore se mail non parte per mancanza di dati nell'env,
//			- 	La password non viene generata correttamente rispetto al formato.
//					il formato deve essere almeno 6 caratteri con almeno una lettera minuscola,
// 					una maiuscola, un numero ed un carattere speciale
router.post(
	'/recupera_password',
	emailClienteValidator(body('email')),
	validateMiddleware,
	ClienteController.recuperaPassword
);

export default router;
