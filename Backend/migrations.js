const migrationCliente = require('./database/Migrations/migrationCliente');
const migrationFiliale = require('./database/Migrations/migrationFiliale');
const migrationImpiegato = require('./database/Migrations/migrationImpiegato');
const migrationPagamento = require('./database/Migrations/migrationPagamento');
const migrationTorretta = require('./database/Migrations/migrationTorretta');
const migrationProdotto = require('./database/Migrations/migrationProdotto');
const migrationPrenotazione = require('./database/Migrations/migrationPrenotazione');
const migrationOrdine = require('./database/Migrations/migrationOrdine');
const migrationOrdProdotto = require('./database/Migrations/migrationOrdProd');
const migrationAsporto = require('./database/Migrations/migrationAsporto');
const migrationAspProd = require('./database/Migrations/migrationAspProd');

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

const args = process.argv.slice(2);

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
    console.log("🌱 Il seed è ancora da implementare!");
}

