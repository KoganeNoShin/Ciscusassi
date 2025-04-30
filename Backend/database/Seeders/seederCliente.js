const cliente = require('../../Models/cliente');
const { faker } = require('@faker-js/faker');

function generateCliente(count) 
{
    for (let i = 0; i < count; i++) 
    {
        let nome = faker.person.firstName();
        let cognome = faker.person.lastName();
        let email = faker.internet.email( { firstName: nome, lastName: cognome } );
        let password = "QuestaPasswordEMoltoSicura!";
        let punti = faker.number.int( { min: 0, max: 1000000 } );
        
        cliente.create({ nome: nome, cognome: cognome, email: email, password: password, punti: punti}).then( () => {
            console.log(`👦🏽 ${nome} ${cognome} è diventato nostro cliente!`);
        }).catch( () => {
            console.log(`💀 ${nome} ${cognome} ci ha lasciato prematuramente...`);
        });   
    }
}

module.exports = { generateCliente }