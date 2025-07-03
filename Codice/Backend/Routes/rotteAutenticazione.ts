import { Router } from 'express';

// ----- Middlewares -----

import validateMiddleware from '../Middleware/validateMiddleware';
import authMiddleware from '../Middleware/authMiddleware';

// ----- Validatori -----

import { loginValidator } from '../Validators/authValidator';

// ----- Controller -----

import AuthController from '../Controllers/authController';

const router = Router();

// ----- Rotte -----
router.post('/login', loginValidator, validateMiddleware, AuthController.login);

router.get('/logout', authMiddleware, AuthController.logout);

export default router;
