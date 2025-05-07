const filiale = require('../../Models/filiale');
const { faker } = require('@faker-js/faker');

async function generateFiliale() 
{
    
    return new Promise(async (resolve, reject) => {
        let numeroFiliali = 4;
        let vieFiliali = ["Via Vincenzo Piazza Martini, 45", "Via Palmerino, 52/A", "Via Catania, 17", "Via Saitta Longhi, 116G"];
    
        let filialiPromises = [];

        for (let i = 0; i < numeroFiliali; i++) 
        {
           
            let filialePromise = filiale.create({ comune: "Palermo", indirizzo: vieFiliali[i], num_tavoli: faker.number.int({min: 10, max: 30}), immagine: faker.image.dataUri({width: 512, height: 512, type: 'svg-base64'})}).then( () => {
                console.log(`🏡 Abbiamo aperto la filiale in ${vieFiliali[i]}!`);
            }).catch( (err) => {
                console.log(`🏚️ La filiale in ${vieFiliali[i]} è andata in bancarotta a causa di: ${err}`);
                throw err;
            });   

            filialiPromises.push(filialePromise);
        }

        // Usiamo promise all per assicurarci che tutte le filiali siano state create!

        await Promise.all(filialiPromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });


}

module.exports = { generateFiliale }