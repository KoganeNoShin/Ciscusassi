"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const clienteService_1 = __importDefault(require("../Services/clienteService"));
class ClienteController {
    static async register(req, res) {
        try {
            const data = req.body;
            const result = await clienteService_1.default.register(data);
            res.status(200).json({
                success: true,
                message: "Cliente registrato con successo",
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Errore durante la registrazione" + error.message,
            });
        }
    }
    static async login(req, res) {
        res.status(200).json({
            success: true,
            message: 'Login effettuato'
        });
    }
    static async logout(req, res) {
        // #Todo: Invalidare il token
        res.status(200).json({
            success: true,
            message: 'Logout effettuato'
        });
    }
}
exports.default = ClienteController;
