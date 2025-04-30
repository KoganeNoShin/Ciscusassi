const migrationCliente = require('./Database/Migrations/migrationCliente');
const migrationFiliale = require('./Database/Migrations/migrationFiliale');
const migrationImpiegato = require('./Database/Migrations/migrationImpiegato');
const migrationPagamento = require('./Database/Migrations/migrationPagamento');
const migrationTorretta = require('./Database/Migrations/migrationTorretta');
const migrationProdotto = require('./Database/Migrations/migrationProdotto');
const migrationPrenotazione = require('./Database/Migrations/migrationPrenotazione');
const migrationOrdine = require('./Database/Migrations/migrationOrdine');
const migrationOrdProdotto = require('./Database/Migrations/migrationOrdProd');
const migrationAsporto = require('./Database/Migrations/migrationAsporto');
const migrationAspProd = require('./Database/Migrations/migrationAspProd');

const seederCliente = require('./Database/Seeders/seederCliente');

const args = process.argv.slice(2);

function dropAll() {
    migrationCliente.dropTable();
    migrationFiliale.dropTable();
    migrationImpiegato.dropTable();
    migrationPagamento.dropTable();
    migrationTorretta.dropTable();
    migrationProdotto.dropTable();
    migrationPrenotazione.dropTable();
    migrationOrdine.dropTable();
    migrationOrdProdotto.dropTable();
    migrationAsporto.dropTable();
    migrationAspProd.dropTable();
}

function createTables() {
    migrationCliente.createIfDoesntExists();
    migrationFiliale.createIfDoesntExists();
    migrationImpiegato.createIfDoesntExists();
    migrationPagamento.createIfDoesntExists();
    migrationTorretta.createIfDoesntExists();
    migrationProdotto.createIfDoesntExists();
    migrationPrenotazione.createIfDoesntExists();
    migrationOrdine.createIfDoesntExists();
    migrationOrdProdotto.createIfDoesntExists();
    migrationAsporto.createIfDoesntExists();
    migrationAspProd.createIfDoesntExists();
}

function seedDB(){
    seederCliente.generateCliente(5);
}

if (args.includes('--help')) 
{
    console.log("ℹ️  Usa --reset per droppare le tabelle e ricostruire il DB da capo.");
    console.log("ℹ️  Usa --seed per popolare le tabelle con dati randomici ma consistenti.");
    return;
} 
else if(args.includes('--reset'))
{
    dropAll();
}

createTables();

if(args.includes('--seed'))
{
    seedDB();
}

