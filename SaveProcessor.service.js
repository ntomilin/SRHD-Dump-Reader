const SaveLoaderService = require('./SaveLoader.service');

const { StateManager } = require('./state/State.service')
let stateManager;

const PlanetService = require('./workers/Planets.service');
const StarService = require('./workers/Star.service');
const BracketsService = require('./workers/Brackets.service');
const HiddenItemService = require('./workers/HiddenItem.service');

class SaveProcessorService {

    constructor() {
        this.saveLoader = new SaveLoaderService();
        stateManager = new StateManager();
        this.stateManager = stateManager;

        this.handlers = [
            new HiddenItemService(stateManager),
            new PlanetService(stateManager),
            new StarService(stateManager),
            new BracketsService(stateManager),
        ];
    }

    _processSave() {
        for (const line of this.content) {
            for (const handler of this.handlers) {
                if (handler.canHandle(line)) {
                    let oldState = JSON.parse(JSON.stringify(this.stateManager.getState()));

                    const handled = handler.handle(line);

                    if (handled) {
                        const newState = this.stateManager.getState();
                        //console.log(`${ line }\nUpdate state from \n[${ JSON.stringify(oldState) }] to \n[${ JSON.stringify(newState) }]\n`);
                    }
                    break;
                }
            }
        }
    }

    allPlanetsAreIndustrial() {
        const planets = this.stateManager.getState().planets;
        for (const planet in planets) {
            if (planets[planet] !== 'Industrial') {
                return false;
            }
        }
        return true;
    }

    async process(save) {
        this.content = await this.saveLoader.getLoadedSave(save);
        this._processSave();
        //console.dir(this.stateManager.getState(), { depth: 3 });
    }
}


module.exports = SaveProcessorService;
