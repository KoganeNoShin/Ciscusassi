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
import PrenotazioneController from '../Controllers/prenotazioneController';

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

router.get(
	'/prenotazioni', // ❌ Ma sicuro che qui non ci dovrebbe essere l'id_cliente? Mettendoglielo funziona (frontend non c'è)
	authMiddleware,//  ✅ Si Daniele, qua non ci va, Lo prende dall'header
	validateMiddleware,
	PrenotazioneController.getPrenotazioniByCliente
);

export default router;
