const fs = require('fs');
const fsp = require('fs').promises;

class SavesFilesService {
    processedSaves = [];
    SAVES_FOLDER = 'C:\\Users\\Nikita\\Documents\\SpaceRangersHD\\Save';

    getAllSavesNames() {
        return new Promise((resolve) => {
            fs.readdir(this.SAVES_FOLDER, (err, files) => {
                if(err) {
                    console.error('[ERR] Error reading saves directory:\n', err);
                    resolve([]);
                }
                const dumps = files.filter(f => f.indexOf('autodump') !== -1);

                const filesWithoutResolution = dumps.map(f => {
                    const regex = /autodump[\d]{8}-[\d]{6}/;
                    const matchResult = f.match(regex);

                    if(!matchResult || !matchResult[0]) {
                        console.error(`Skip ${ f } in regex for some reason`, err);
                        return null;
                    }

                    return matchResult[0];
                }).filter(x => x !== null);

                const savesNames = new Set(filesWithoutResolution);
                resolve(Array.from(savesNames))
            });
        });
    }

    async getSavesNamesToProcess() {
        const saves = await this.getAllSavesNames();
        return saves.filter(save => this.processedSaves.indexOf(save) === -1);
    }

    addProcessedSave(save) {
        this.processedSaves.push(save);
        // TODO: store save
    }

    async removeSaveFiles(save) {
        const pr = [
            fsp.unlink(`${this.SAVES_FOLDER}/${save}.txt`),
            fsp.unlink(`${this.SAVES_FOLDER}/${save}_map.png`),
            fsp.unlink(`${this.SAVES_FOLDER}/${save}.sav_`),
            fsp.unlink(`${this.SAVES_FOLDER}/${save}.report`),
        ];

        try {
            await Promise.all(pr);
            console.log(`${save} is removed`);
        } catch (err) {
            console.log(`${save} is NOT removed\n`, err);
        }
    }
}

module.exports = SavesFilesService;
