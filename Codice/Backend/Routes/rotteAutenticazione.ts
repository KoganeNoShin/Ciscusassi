import { Router } from 'express';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';

// ----- Validatori -----

import { emailValidator, loginValidator } from '../Validators/authValidator';

// ----- Controller -----

import AuthController from '../Controllers/authController';
import { body } from 'express-validator';

const router = Router();

// ----- Rotte -----
router.post('/login', loginValidator, validateMiddleware, AuthController.login);

router.get('/logout', authMiddleware, AuthController.logout);


router.post(
	'/recupera_password',
	emailValidator(body('email')),
	validateMiddleware,
	AuthController.recuperaPassword
);

export default router;
