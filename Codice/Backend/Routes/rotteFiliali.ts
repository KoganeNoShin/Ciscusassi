import { Router } from 'express';
import { param } from 'express-validator';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';
import roleMiddleware from '../Middleware/roleMiddleware';

// ----- Validatori -----

import {
	addFilialeValidator,
	idFilialeValidator,
	updateFilialeValidator,
} from '../Validators/filialeValidator';

import {
	addImpiegatoValidator,
	matricolaImpiegatoValidator,
	updateImpiegatoValidator,
} from '../Validators/impiegatoValidator';

// ----- Controller -----

import FilialeController from '../Controllers/filialeController';
import ImpiegatoController from '../Controllers/impiegatoController';

const router = Router();

// ----- Rotte -----

router.get('', FilialeController.getAllFiliali); // ✅

router.post(
	'/addFiliale', // ✅ Teoricamente va bene, da capire quando sistemo l'invio delle immagini in base64
	addFilialeValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.addFiliale
);

router.put(
	'/updateFiliale/:id_filiale', // ✅ Teoricamente va bene, da capire quando sistemo l'invio delle immagini in base64
	updateFilialeValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.updateFiliale
);

router.delete(
	'/deleteFiliale/:id_filiale', // ✅
	idFilialeValidator(param('id_filiale')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	FilialeController.deleteFiliale
);

// Routes per gli Impiegati

// ❌ I validatori non vanno bene, in particolare la data,
// inoltre qui non dovrei passare la password, o comunque se serve dopo la dovrebbe generare in automatico
router.post(
	'/addImpiegato',
	addImpiegatoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.addImpiegato
);

router.put(
	'/updateImpiegato/:matricola', // ❌ I validatori non vanno bene
	updateImpiegatoValidator,
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.updateImpiegato
);

router.delete(
	'/deleteImpiegato/:matricola', // ✅
	matricolaImpiegatoValidator(param('matricola')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.deleteImpiegato
);

router.get(
	'/:id_filiale/impiegati', // ✅
	idFilialeValidator(param('id_filiale')),
	validateMiddleware,
	authMiddleware,
	roleMiddleware(['amministratore']),
	ImpiegatoController.getAllImpiegati
);

export default router;
