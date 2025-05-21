"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cliente_1 = __importDefault(require("../Models/cliente"));
class ClienteService {
    static async register(input) {
        const existing = await cliente_1.default.findByEmail(input.email);
        if (existing) {
            throw new Error('Email già registrata');
        }
        const clienteData = {
            nome: input.nome,
            cognome: input.cognome,
            data_nascita: input.data_nascita,
            email: input.email,
            password: input.password,
            image: input.image,
            punti: 0
        };
        return await cliente_1.default.create(clienteData);
    }
    static async login() {
        return true;
    }
}
exports.default = ClienteService;
