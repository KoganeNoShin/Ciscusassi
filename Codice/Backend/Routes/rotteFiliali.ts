import { Router } from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware'; // Gestisce gli errori di validazione
import authMiddleware from '../Middleware/authMiddleware'; // Controlla che l'utente sia autenticato
import roleMiddleware from '../Middleware/roleMiddleware'; // Verifica che l'utente abbia un determinato ruolo

// ----- Validatori -----

import {
	addFilialeValidator,       // Valida i dati per la creazione di una nuova filiale
	idFilialeValidator,        // Valida l'ID di una filiale
	updateFilialeValidator,    // Valida i dati per l’aggiornamento di una filiale
} from '../Validators/filialeValidator';

import {
	addImpiegatoValidator,         aggiornaPasswordValidator,         // Valida i dati per la creazione di un nuovo impiegato
	matricolaImpiegatoValidator,   // Valida la matricola dell’impiegato
	updateImpiegatoValidator,      // Valida i dati per l’aggiornamento di un impiegato
} from '../Validators/impiegatoValidator';

// ----- Controller -----

import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';

const router = Router();

// =========================
//        Rotte Filiali
// =========================

/**
 * @route GET /filiale
 * @desc Restituisce tutte le filiali
 * @access Pubblico
 */
router.get('', FilialeController.getAllFiliali);

/**
 * @route POST /filiale/addFiliale
 * @desc Aggiunge una nuova filiale
 * @access Privato (solo amministratori)
 * @middleware addFilialeValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.post(
	'/addFiliale',
	addFilialeValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.addFiliale
);

/**
 * @route PUT /filiale/updateFiliale/:id_filiale
 * @desc Aggiorna una filiale esistente tramite ID
 * @access Privato (solo amministratori)
 * @middleware updateFilialeValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.put(
	'/updateFiliale/:id_filiale',
	updateFilialeValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.updateFiliale
);

/**
 * @route DELETE /filiale/deleteFiliale/:id_filiale
 * @desc Elimina una filiale esistente tramite ID
 * @access Privato (solo amministratori)
 * @middleware idFilialeValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.delete(
	'/deleteFiliale/:id_filiale',
	idFilialeValidator(param('id_filiale')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.deleteFiliale
);

// ============================
//        Rotte Impiegati
// ============================

/**
 * @route POST /filiale/addImpiegato
 * @desc Aggiunge un nuovo impiegato
 * @access Privato (solo amministratori)
 * @middleware addImpiegatoValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.post(
	'/addImpiegato',
	addImpiegatoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.addImpiegato
);

/**
 * @route PUT /filiale/updateImpiegato/:matricola
 * @desc Aggiorna i dati di un impiegato esistente tramite matricola
 * @access Privato (solo amministratori)
 * @middleware updateImpiegatoValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.put(
	'/updateImpiegato/:matricola',
	updateImpiegatoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.updateImpiegato
);

/**
 * @route DELETE /filiale/deleteImpiegato/:matricola
 * @desc Elimina un impiegato tramite matricola
 * @access Privato (solo amministratori)
 * @middleware matricolaImpiegatoValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.delete(
	'/deleteImpiegato/:matricola',
	matricolaImpiegatoValidator(param('matricola')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.deleteImpiegato
);

/**
 * @route PUT /filiale/impiegato/nuova_password
 * @desc Permette al impiegato autenticato di cambiare la propria password
 * @access Privato
 * @middleware authMiddleware, aggiornaPasswordValidator, validateMiddleware
 */
router.put(
	'/impiegato/nuova_password',
	authMiddleware,
	aggiornaPasswordValidator,
	validateMiddleware,
	ImpiegatoController.aggiornaPassword
);

/**
 * @route GET /filiale/:id_filiale/impiegati
 * @desc Restituisce tutti gli impiegati associati a una filiale
 * @access Privato (solo amministratori)
 * @middleware idFilialeValidator, validateMiddleware, authMiddleware, roleMiddleware
 */
router.get(
	'/:id_filiale/impiegati',
	idFilialeValidator(param('id_filiale')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.getAllImpiegati
);

export default router;