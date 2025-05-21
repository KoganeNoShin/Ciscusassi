"use strict";
// Importiamo le migrations per creare le tabelle
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const migrationCliente_1 = __importDefault(require("./Database/Migrations/migrationCliente"));
const migrationFiliale_1 = __importDefault(require("./Database/Migrations/migrationFiliale"));
const migrationImpiegato_1 = __importDefault(require("./Database/Migrations/migrationImpiegato"));
const migrationPagamento_1 = __importDefault(require("./Database/Migrations/migrationPagamento"));
const migrationTorretta_1 = __importDefault(require("./Database/Migrations/migrationTorretta"));
const migrationProdotto_1 = __importDefault(require("./Database/Migrations/migrationProdotto"));
const migrationPrenotazione_1 = __importDefault(require("./Database/Migrations/migrationPrenotazione"));
const migrationOrdine_1 = __importDefault(require("./Database/Migrations/migrationOrdine"));
const migrationOrdProd_1 = __importDefault(require("./Database/Migrations/migrationOrdProd"));
const migrationAsporto_1 = __importDefault(require("./Database/Migrations/migrationAsporto"));
const migrationAspProd_1 = __importDefault(require("./Database/Migrations/migrationAspProd"));
// Importiamo i seeder per popolare le tabelle
const seederCliente_1 = __importDefault(require("./Database/Seeders/seederCliente"));
const seederFiliale_1 = __importDefault(require("./Database/Seeders/seederFiliale"));
const seederTorretta_1 = __importDefault(require("./Database/Seeders/seederTorretta"));
const seederImpiegato_1 = __importDefault(require("./Database/Seeders/seederImpiegato"));
const seederProdotto_1 = __importDefault(require("./Database/Seeders/seederProdotto"));
const seederAsporto_1 = __importDefault(require("./Database/Seeders/seederAsporto"));
const seederAspProd_1 = __importDefault(require("./Database/Seeders/seederAspProd"));
const seederPrenotazione_1 = __importDefault(require("./Database/Seeders/seederPrenotazione"));
const seederOrdine_1 = __importDefault(require("./Database/Seeders/seederOrdine"));
const seederOrdProd_1 = __importDefault(require("./Database/Seeders/seederOrdProd"));
const seederPagamento_1 = __importDefault(require("./Database/Seeders/seederPagamento"));
const args = process.argv.slice(2);
async function dropAll() {
    await migrationCliente_1.default.dropTable();
    await migrationFiliale_1.default.dropTable();
    await migrationImpiegato_1.default.dropTable();
    await migrationPagamento_1.default.dropTable();
    await migrationTorretta_1.default.dropTable();
    await migrationProdotto_1.default.dropTable();
    await migrationPrenotazione_1.default.dropTable();
    await migrationOrdine_1.default.dropTable();
    await migrationOrdProd_1.default.dropTable();
    await migrationAsporto_1.default.dropTable();
    await migrationAspProd_1.default.dropTable();
}
async function createTables() {
    await migrationCliente_1.default.createIfDoesntExists();
    await migrationFiliale_1.default.createIfDoesntExists();
    await migrationImpiegato_1.default.createIfDoesntExists();
    await migrationPagamento_1.default.createIfDoesntExists();
    await migrationTorretta_1.default.createIfDoesntExists();
    await migrationProdotto_1.default.createIfDoesntExists();
    await migrationOrdProd_1.default.createIfDoesntExists();
    await migrationOrdine_1.default.createIfDoesntExists();
    await migrationAsporto_1.default.createIfDoesntExists();
    await migrationAspProd_1.default.createIfDoesntExists();
    await migrationPrenotazione_1.default.createIfDoesntExists();
}
async function seedDB() {
    await seederCliente_1.default.generateCliente(15);
    await seederFiliale_1.default.generateFiliale();
    await seederTorretta_1.default.generateTorretta();
    await seederImpiegato_1.default.generateImpiegato();
    await seederProdotto_1.default.generateProdotto();
    await seederAsporto_1.default.generateAsporto(20);
    await seederAspProd_1.default.generateAspProd();
    await seederPrenotazione_1.default.generatePrenotazione(30);
    await seederOrdine_1.default.generateOrdine();
    await seederOrdProd_1.default.generateOrdProd();
    await seederPagamento_1.default.generatePagamento();
}
async function run() {
    if (args.includes('--help')) {
        console.log("ℹ️  Usa --reset per droppare le tabelle e ricostruire il DB da capo.");
        console.log("ℹ️  Usa --seed per popolare le tabelle con dati randomici ma consistenti.");
    }
    else if (args.includes('--reset')) {
        await dropAll();
    }
    await createTables();
    if (args.includes('--seed')) {
        await seedDB();
    }
}
run().catch((err) => {
    console.error(err);
});
