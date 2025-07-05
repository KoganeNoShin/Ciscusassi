import { Router } from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware'; // Gestisce gli errori dei validator
import authMiddleware from '../Middleware/authMiddleware'; // Verifica che l'utente sia autenticato
import roleMiddleware from '../Middleware/roleMiddleware'; // Verifica che l'utente abbia uno dei ruoli richiesti

// ----- Validatori -----

import {
	addProdottoValidator,      // Valida i dati di creazione di un prodotto
	idProdottoValidator,       // Valida l'ID di un prodotto (come parametro)
	updateProdottoValidator,   // Valida i dati per l'aggiornamento di un prodotto
} from '../Validators/prodottoValidator';

// ----- Controller -----

import ProdottoController from '../Controllers/prodottoController';

const router = Router();

// =========================
//        Piatti Normali
// =========================

/**
 * @route GET /menu
 * @desc Restituisce tutti i prodotti del menù (piatti e bevande)
 * @access Pubblico
 */
router.get('', ProdottoController.getAllProdotti);

/**
 * @route POST /menu/addProdotto
 * @desc Aggiunge un nuovo prodotto al menù
 * @access Privato (solo amministratori)
 * @middleware authMiddleware, roleMiddleware, addProdottoValidator, validateMiddleware
 */
router.post(
	'/addProdotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	addProdottoValidator,
	validateMiddleware,
	ProdottoController.addProdotto
);

/**
 * @route PUT /menu/updateProdotto/:id_prodotto
 * @desc Aggiorna le informazioni di un prodotto esistente
 * @access Privato (solo amministratori)
 * @middleware authMiddleware, roleMiddleware, updateProdottoValidator, validateMiddleware
 */
router.put(
	'/updateProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	updateProdottoValidator,
	validateMiddleware,
	ProdottoController.updateProdotto
);

/**
 * @route DELETE /menu/deleteProdotto/:id_prodotto
 * @desc Elimina un prodotto dal menù tramite ID
 * @access Privato (solo amministratori)
 * @middleware authMiddleware, roleMiddleware, idProdottoValidator, validateMiddleware
 */
router.delete(
	'/deleteProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validateMiddleware,
	ProdottoController.deleteProdotto
);

// ==============================
//        Piatto del Giorno
// ==============================

/**
 * @route GET /menu/piattoDelGiorno
 * @desc Restituisce il prodotto attualmente selezionato come "piatto del giorno"
 * @access Pubblico
 */
router.get('/piattoDelGiorno', ProdottoController.getProdottoDelGiorno);

/**
 * @route PUT /menu/changePiattoDelGiorno/:id_prodotto
 * @desc Imposta il prodotto specificato come nuovo "piatto del giorno"
 * @access Privato (solo amministratori)
 * @middleware authMiddleware, roleMiddleware, idProdottoValidator, validateMiddleware
 */
router.put(
	'/changePiattoDelGiorno/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validateMiddleware,
	ProdottoController.changePiattoDelGiorno
);

export default router;