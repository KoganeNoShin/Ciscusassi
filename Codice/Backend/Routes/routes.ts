import express from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import authMiddleware from '../Middleware/authMiddleware'; // Verifica autenticazione JWT
import roleMiddleware from '../Middleware/roleMiddleware'; // Verifica ruolo utente (es. amministratore)
import validateMiddleware from '../Middleware/validateMiddleware'; // Gestisce gli errori di validazione

// ----- Validatori -----

import { addAsportoValidator } from '../Validators/asportoValidator';
import { annoPagamentoValidator } from '../Validators/pagamentoValidator';
import { idTorrettaValidator } from '../Validators/torrettaValidator';

// ----- Controller -----

import AsportoController from '../Controllers/asportoController';
import PagamentoController from '../Controllers/pagamentoController';
import TorrettaController from '../Controllers/torrettaController';
import PrenotazioneController from '../Controllers/prenotazioneController';

// ----- Rotte modulari con prefissi -----
// Ogni modulo esporta un router con le rotte per una specifica funzionalità

import rotteAutenticazione from './rotteAutenticazione';
import rotteClienti from './rotteClienti';
import rotteFiliali from './rotteFiliali';
import rotteMenu from './rotteMenu';
import rottePrenotazioni from './rottePrenotazioni';
import torrettaAuthMiddleware from '../Middleware/torrettaMiddleware';

const router = express.Router();

/**
 * Tutte le rotte di autenticazione: login, registrazione, logout, ecc.
 * Prefisso: `/auth`
 */
router.use('/auth', rotteAutenticazione);

/**
 * Tutte le rotte relative ai clienti: registrazione, visualizzazione, ecc.
 * Prefisso: `/cliente`
 */
router.use('/cliente', rotteClienti);

/**
 * Tutte le rotte relative alle filiali: aggiunta, modifica, cancellazione, ecc.
 * Prefisso: `/filiale`
 */
router.use('/filiale', rotteFiliali);

/**
 * Tutte le rotte relative alla gestione del menu e dei prodotti.
 * Prefisso: `/menu`
 */
router.use('/menu', rotteMenu);

/**
 * Tutte le rotte relative alle prenotazioni.
 * Prefisso: `/prenotazione`
 */
router.use('/prenotazione', rottePrenotazioni);

// ----- Rotte dirette (senza prefisso) -----

/**
 * @route POST /addAsporto
 * @desc Inserisce un nuovo ordine da asporto
 * @access Privato (utente autenticato)
 * @middleware `addAsportoValidator`, `validateMiddleware`, `authMiddleware`
 */
router.post(
	'/addAsporto',
	addAsportoValidator,
	validateMiddleware,
	authMiddleware,
	AsportoController.addAsporto
);

/**
 * @route GET /pagamenti/:year
 * @desc Restituisce i pagamenti aggregati per anno
 * @access Privato, solo amministratori
 * @middleware `annoPagamentoValidator`, `authMiddleware`, `roleMiddleware`
 */
router.get(
	'/pagamenti/:year',
	authMiddleware,
	roleMiddleware(['amministratore']),
	annoPagamentoValidator(param('year')),
	validateMiddleware,
	PagamentoController.getPagamentiByYear
);

/**
 * @route GET /torrette/:id_torretta
 * @desc Restituisce i dettagli di una torretta (potrebbe non essere usata)
 * @access Pubblico
 * @middleware `idTorrettaValidator`
 */
router.get(
	'/torrette/:id_torretta',
	idTorrettaValidator(param('id_torretta')),
	validateMiddleware,
	TorrettaController.getTorrettaByID
);

/**
 * @route GET /:id_torretta/otp
 * @desc Recupera l'OTP valido per una determinata torretta, calcolato in base all'orario attuale
 * @access Pubblico (o autenticato, a seconda del caso d'uso)
 * @middleware `idTorrettaValidator`
 */
router.get(
	'/:id_torretta/otp',
	torrettaAuthMiddleware,
	idTorrettaValidator(param('id_torretta')),
	validateMiddleware,
	PrenotazioneController.getOTPByIdTorrettaAndData
);

export default router;