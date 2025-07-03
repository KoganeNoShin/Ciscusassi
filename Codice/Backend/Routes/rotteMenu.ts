import { Router } from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';

// ----- Validatori -----

import {
	addProdottoValidator,
	idProdottoValidator,
	updateProdottoValidator,
} from '../Validators/prodottoValidator';

// ----- Controller -----

import ProdottoController from '../Controllers/prodottoController';

const router = Router();

// ----- Rotte -----

// ----- Piatti normali -----

router.get('', ProdottoController.getAllProdotti);

router.post(
	'/menu/addProdotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	addProdottoValidator,
	validateMiddleware,
	ProdottoController.addProdotto
);

router.put(
	'/updateProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	updateProdottoValidator,
	validateMiddleware,
	ProdottoController.updateProdotto
);

router.delete(
	'/deleteProdotto/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validateMiddleware,
	ProdottoController.deleteProdotto
);

// ----- Piatto del giorno -----

router.get('/piattoDelGiorno', ProdottoController.getProdottoDelGiorno);

router.put(
	'/changePiattoDelGiorno/:id_prodotto',
	authMiddleware,
	roleMiddleware(['amministratore']),
	idProdottoValidator(param('id_prodotto')),
	validateMiddleware,
	ProdottoController.changePiattoDelGiorno
);

export default router;
