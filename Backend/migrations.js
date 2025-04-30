const migrationCliente = require('./Migrations/migrationCliente');
const migrationFiliale = require('./Migrations/migrationFiliale');
const migrationImpiegato = require('./Migrations/migrationImpiegato');
const migrationPagamento = require('./Migrations/migrationPagamento');
const migrationTorretta = require('./Migrations/migrationTorretta');
const migrationProdotto = require('./Migrations/migrationProdotto');
const migrationPrenotazione = require('./Migrations/migrationPrenotazione');
const migrationOrdine = require('./Migrations/migrationOrdine');
const migrationOrdProdotto = require('./Migrations/migrationOrdProd');
const migrationAsporto = require('./Migrations/migrationAsporto');
const migrationAspProd = require('./Migrations/migrationAspProd');

const args = process.argv.slice(2);

if (args.includes('--reset')) 
{
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
else 
{
    console.log("ℹ️ Usa --reset per droppare le tabelle e ricostruire il DB da capo.");
}

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