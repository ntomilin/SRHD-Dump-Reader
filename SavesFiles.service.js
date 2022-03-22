const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

class SavesFilesService {
    SAVES_FOLDER = 'C:\\Users\\Nikita\\Documents\\SpaceRangersHD\\Save';

    getAllSavesNames() {
        return new Promise((resolve) => {
            fs.readdir(this.SAVES_FOLDER, (err, files) => {
                if (err) {
                    console.error('[ERR] Error reading saves directory:\n', err);
                    resolve([]);
                }
                const dumps = files.filter(f => f.indexOf('autodump') !== -1);

                const filesWithoutResolution = dumps.map(f => {
                    const regex = /autodump[\d]{8}-[\d]{6}/;
                    const matchResult = f.match(regex);

                    if (!matchResult || !matchResult[0]) {
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
        const processedSaves = this.getProcessedSaves();
        return saves.filter(save => processedSaves.indexOf(save) === -1);
    }

    async removeSaveFiles(save) {
        const pr = [
            fsp.unlink(`${ this.SAVES_FOLDER }/${ save }.txt`),
            fsp.unlink(`${ this.SAVES_FOLDER }/${ save }_map.png`),
            fsp.unlink(`${ this.SAVES_FOLDER }/${ save }.sav_`),
            fsp.unlink(`${ this.SAVES_FOLDER }/${ save }.report`),
        ];

        try {
            await Promise.all(pr);
            console.log(`${ save } is removed`);
        } catch (err) {
            console.log(`${ save } is NOT removed\n`, err);
        }
    }

    async updateDb(save, items, artifacts, summary) {
        let db;

        try {
            db = require('./db.json');
        } catch (err) {
            db = [];
        }

        let itemsStr = '';

        for (const key of Object.keys(items)) {
            const artifact = Object.keys(items[key])[0];
            //console.log(items[key][artifact]);
            items[key] = JSON.stringify(items[key][artifact])
        }

        db.push({
            save,
            items,
            artifacts,
            summary
        })

        this._sortDb(db);

        const dbPath = path.join(__dirname, 'db.json');
        await fsp.writeFile(dbPath, JSON.stringify(db, null, '  '));
    }

    _sortDb(db) {
        function computeReq(obj) {
            //console.log(obj);
            return Object.keys(obj.summary.required).reduce((acc, x) => {
                return acc += obj.summary.required[x] > 0 ? 1 : 0
            }, 0)
        }

        function computeRequiredArtifactQuantity(obj, key) {
            return obj.summary.required[key];
        }

        if (db.length >= 2) {
            db = db.sort((a, b) => {
                const nReqA = computeReq(a);
                const nReqB = computeReq(b);

                if (nReqA !== nReqB) {
                    return nReqB - nReqA;
                }

                const item1 = 'Трансфакторный маяк';
                const nItem1A = computeRequiredArtifactQuantity(a, item1);
                const nItem1B = computeRequiredArtifactQuantity(b, item1);

                if (nItem1A !== nItem1B) {
                    return nItem1B - nItem1A;
                }

                const item2 = 'Обливионный коннектор';
                const nItem2A = computeRequiredArtifactQuantity(a, item2);
                const nItem2B = computeRequiredArtifactQuantity(b, item2);

                if (nItem2A !== nItem2B) {
                    return nItem2B - nItem2A;
                }

                return 0;
            });
        }
    }

    getProcessedSaves() {
        let saves = [];
        try {
            saves = require('./db.json').map(x => x.save);
        } catch (err) {
            saves = [];
        }
        return saves;
    }
}

module.exports = SavesFilesService;
