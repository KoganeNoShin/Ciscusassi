"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const clienteController_1 = __importDefault(require("../Controllers/clienteController"));
const authValidator_1 = __importDefault(require("../Validators/authValidator"));
const router = express_1.default.Router();
// Registrazione
router.post('/register', authValidator_1.default.registerValidator, authValidator_1.default.validate, clienteController_1.default.register);
// Login
router.post('/login', authValidator_1.default.loginValidator, authValidator_1.default.validate, clienteController_1.default.login);
// Logout
router.post('/logout', clienteController_1.default.logout);
exports.default = router;
