const torretta = require('../../Models/torretta');
const filiale = require('../../Models/filiale');

async function generateTorretta() 
{

    return new Promise(async (resolve, reject) => {

        let torrettePromises = [];
        
        filiale.findAll().then( (res) => {
            res.forEach(filiale => {
                let nTorrette = Math.ceil(filiale.num_tavoli/3);

                for (let i = 0; i < nTorrette; i++) {

                    let torrettaPromise = torretta.create({ref_filiale: filiale.id_filiale}).then( () => {
                        console.log(`🏰 Torretta aggiunta alla filiale in via ${filiale.indirizzo}!`);
                    }).catch( (err) => {
                        console.log(`🧨 Torretta esplosa alla filiale in via ${filiale.indirizzo}!. Causa di esplosione: ${err}`);
                        reject(err);
                    }); 

                    torrettePromises.push(torrettaPromise);
                }
            });

        }).catch((err) =>{
            console.error(err);
            reject(err);
        });        

        await Promise.all(torrettePromises)
        .then(() => {
            resolve();
        })
        .catch((err) => {
            reject(err);
        });
    });


}

module.exports = { generateTorretta }