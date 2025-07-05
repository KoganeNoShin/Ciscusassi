import { Router } from 'express';
import { body } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware'; // Gestisce errori di validazione
import authMiddleware from '../Middleware/authMiddleware'; // Verifica l'autenticazione utente

// ----- Validatori -----

import {
	addClienteValidator,          // Validatore per registrazione cliente
	aggiornaPasswordValidator,   // Validatore per aggiornamento password
	emailClienteValidator,       // Validatore per nuova email
	updateClienteValidator,      // Validatore per aggiornamento dati personali
} from '../Validators/clienteValidator';

// ----- Controller -----

import ClienteController from '../Controllers/clienteController'; // Controller principale clienti
import PrenotazioneController from '../Controllers/prenotazioneController'; // Controller per prenotazioni

const router = Router();

// ----- Rotte -----

/**
 * @route POST /cliente/register
 * @desc Registra un nuovo cliente
 * @access Pubblico
 * @middleware addClienteValidator, validateMiddleware
 */
router.post(
	'/register',
	addClienteValidator,
	validateMiddleware,
	ClienteController.register
);

/**
 * @route GET /cliente/points
 * @desc Restituisce i punti fedeltà del cliente autenticato
 * @access Privato
 * @middleware authMiddleware
 */
router.get(
	'/points',
	authMiddleware,
	ClienteController.getPuntiCliente
);

/**
 * @route PUT /cliente/updateDati
 * @desc Aggiorna nome, cognome e numero carta del cliente autenticato
 * @access Privato
 * @middleware authMiddleware, updateClienteValidator, validateMiddleware
 */
router.put(
	'/updateDati',
	authMiddleware,
	updateClienteValidator,
	validateMiddleware,
	ClienteController.aggiornaDatiPersonali
);

/**
 * @route PUT /cliente/nuova_password
 * @desc Permette al cliente autenticato di cambiare la propria password
 * @access Privato
 * @middleware authMiddleware, aggiornaPasswordValidator, validateMiddleware
 */
router.put(
	'/nuova_password',
	authMiddleware,
	aggiornaPasswordValidator,
	validateMiddleware,
	ClienteController.aggiornaPassword
);

/**
 * @route PUT /cliente/nuova_email
 * @desc Permette al cliente autenticato di aggiornare la propria email
 * @access Privato
 * @middleware authMiddleware, emailClienteValidator, validateMiddleware
 */
router.put(
	'/nuova_email',
	authMiddleware,
	emailClienteValidator(body('nuovaEmail')),
	validateMiddleware,
	ClienteController.aggiornaEmail
);

/**
 * @route GET /cliente/prenotazioni
 * @desc Restituisce tutte le prenotazioni del cliente autenticato
 * @access Privato
 * @middleware authMiddleware, validateMiddleware
 */
router.get(
	'/prenotazioni',
	authMiddleware,
	validateMiddleware,
	PrenotazioneController.getPrenotazioniByCliente
);

export default router;