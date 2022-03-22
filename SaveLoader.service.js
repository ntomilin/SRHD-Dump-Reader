const { Transform } = require('stream')
const path = require('path');
const fs = require('fs');
const iconv = require('iconv-lite');

class SaveLoaderService {
    constructor() {
    }

    SAVES_FOLDER = 'C:\\Users\\Nikita\\Documents\\SpaceRangersHD\\Save';
    TEMP_SAVE = (save) => path.join(__dirname, 'working_saves', `${ save }.txt`);

    minifyTransform = new Transform({
        transform: (chunk, encoding, done) => {
            const result = chunk.toString().replace(/\n/g, '').replace(/\t/g, '');
            done(null, result);
        },
    });

    getLoadedSave(save) {
        return new Promise((resolve) => {
            const lines = [];
            const savePath = path.join(this.SAVES_FOLDER, `${ save }.txt`);

            const chunkProcessPipe = new Transform({
                transform(chunk, encoding, done) {
                    lines.push(...chunk.toString().split('\r'));
                    done(null);
                },
            })

            // For some reason flow stops without it
            chunkProcessPipe.on('data', (ch) => {
            });

            const str = fs.createReadStream(savePath)
                .pipe(iconv.decodeStream('cp1251'))
                .pipe(iconv.encodeStream('utf8'))
                .pipe(this.minifyTransform)
                .pipe(chunkProcessPipe)

            str.on('end', () => {
                return resolve(lines)
            })

        })
    }
}

module.exports = SaveLoaderService;
