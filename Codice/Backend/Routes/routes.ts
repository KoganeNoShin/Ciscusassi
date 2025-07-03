import express from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';
import validateMiddleware from '../Middleware/validateMiddleware';

// ----- Validatori -----

import { addAsportoValidator } from '../Validators/asportoValidator';
import { annoPagamentoValidator } from '../Validators/pagamentoValidator';
import { idTorrettaValidator } from '../Validators/torrettaValidator';

// ----- Controller -----

import AsportoController from '../Controllers/asportoController';
import PagamentoController from '../Controllers/pagamentoController';
import TorrettaController from '../Controllers/torrettaController';

// ----- Rotte esterne -----

import rotteAutenticazione from './rotteAutenticazione';
import rotteClienti from './rotteClienti';
import rotteFiliali from './rotteFiliali';
import rotteMenu from './rotteMenu';
import rottePrenotazioni from './rottePrenotazioni';

const router = express.Router();

// ----- Rotte con prefissi -----

router.use('/auth', rotteAutenticazione);
router.use('/clienti', rotteClienti); // tutte le rotte che iniziano con '/clienti'
router.use('/filiali', rotteFiliali); // tutte le rotte che iniziano con '/filiali'
router.use('/menu', rotteMenu); // tutte le rotte che iniziano con '/menu'
router.use('/prenotazioni', rottePrenotazioni); // tutte le rotte che iniziano con '/prenotazioni'

// ----- Rotte senza prefissi -----

router.post(
	'/addAsporto',
	addAsportoValidator,
	validateMiddleware,
	authMiddleware,
	AsportoController.addAsporto
);

router.get(
	'/pagamenti/:year',
	authMiddleware,
	roleMiddleware(['amministratore']),
	annoPagamentoValidator(param('year')),
	validateMiddleware,
	PagamentoController.getPagamentiByYear
);

router.get(
	'/torrette/:id_torretta',
	idTorrettaValidator(param('id_torretta')),
	validateMiddleware,
	TorrettaController.getTorrettaByID
);

export default router;
