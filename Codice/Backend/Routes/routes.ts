import express from 'express';

import UserController from '../Controllers/userController';

import AuthValidator from '../Validators/authValidator';

const router = express.Router();

// Registrazione
router.post('/register', AuthValidator.registerValidator, AuthValidator.validate, UserController.register);

// Login
router.post('/login', AuthValidator.loginValidator, AuthValidator.validate, UserController.login);