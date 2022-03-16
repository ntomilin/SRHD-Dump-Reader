const LINES = {
    // NONE

    STAR_LIST: 'StarList ^{', // // PROCESS_STARS_LIST

    STAR_ID: 'StarId', // // PROCESS_STAR
    STAR_NAME: 'StarName',

    PLANET_LIST: 'PlanetList', // PLANET_LIST

    PLANET_ID: 'PlanetId', // PROCESS_PLANET
    PLANET_NAME: 'PlanetName',
    PLANET_OWNER: 'Owner',
    PLANET_ECONOMY: 'Economy',

    PLANET_TREASURE: 'Treasure', // PROCESS_TREASURES_LIST

    HIDDEN_ITEM: 'HiddenItem', // PROCESS_TREASURE
    HIDDEN_ITEM_ID: 'ItemId',
    HIDDEN_ITEM_NAME: 'IName',
    HIDDEN_ITEM_OWNER: 'Owner',
    HIDDEN_ITEM_SIZE: 'Size',

    OPEN_BRACKET: '^{',
    CLOSE_BRACKET: '}' // previous step
};


const SaveLoaderService = require('./SaveLoader.service');

const { StateManager, STEPS } = require('./state')
let stateManager;

const LoggerService = require('./Logger.service');

let processesLeft = 50;

const config = require('./config.json');
const planets = config.planets;
const { artifacts, items } = config;
let tabs = [];

let isKraa = false;


class SaveProcessorService {

    constructor() {
        this.saveLoader = new SaveLoaderService();
        stateManager =  new StateManager();

        for (const key in artifacts) {
            if (!this.summary[key]) {
                this.summary[key] = {};
            }
            for (const art of artifacts[key]) {
                this.summary[key][art] = 0;
            }
        }
    }

    content = [];

    bracketsStack = [];

    items = {};
    artifacts = {};
    summary = {};

    planets = {
        [planets[0]]: null,
        [planets[1]]: null,
        [planets[2]]: null,
    };

    allPlanetsAreIndustrial() {
        for (const planet in this.planets) {
            if (this.planets[planet] !== 'Industrial') {
                return false;
            }
        }
        return true;
    }

    _processStarListRow = (step, chunk) => {
        stateManager.nextStep();
    }
    _processStarId = (step, chunk) => {
        stateManager.nextStep();

        const rgxMatch = chunk.match(/[\d]+/);
        if (!rgxMatch) return;

        const starId = rgxMatch[0];
        stateManager.setState({ starId });
    }
    _processStarName = (step, chunk) => {
        // stateManager.nextStep();
        const starName = chunk.split('=')[1];
        // console.log(starName)
        stateManager.setState({ starName });
        //console.log(stateManager.getState().planetName)
        // console.log(starName)
        // isKraa = starName === 'Краа';
    }

    _processPlanetList(step, chunk) {
        stateManager.nextStep();
    }

    _processPlanetId(ste, chunk) {
        stateManager.nextStep();

        const rgxMatch = chunk.match(/[\d]+/);
        if (!rgxMatch) return;

        const planetId = rgxMatch[0];
        stateManager.setState({ planetId });
    }

    _processPlanetName = (step, chunk) => {
        const planetName = chunk.split('=')[1];
        stateManager.setState({ planetName });

    }

    _processPlanetEconomy = (step, chunk) => {
        //console.log(stateManager.getState().planetName, chunk);
        if (this.planets[stateManager.getState().planetName] === null) {
            //console.log(stateManager.getState().starName);
            this.planets[stateManager.getState().planetName] = chunk.split('=')[1];
        }
    }

    _processPlanetTreasure = (step, chunk) => {
        stateManager.nextStep();
    }

    _processTreasureId = (step, chunk) => {
        const treasureItemId = chunk.split('=')[1];
        stateManager.nextStep();
        stateManager.setState({ treasureItemId });
    }

    _processHiddenItem = (step, chunk) => {
        stateManager.nextStep();
    }

    _processCloseBrackets(step, chunk) {
        if (this.bracketsStack.length === 0) {
            if (step === STEPS.PROCESS_STAR) {
                // stateIsUpdated = true;
                stateManager.prevStep();
                stateManager.setState({ starId: null, starName: null })
            } else if (step === STEPS.PROCESS_PLANET) {
                // stateIsUpdated = true;
                stateManager.prevStep();
                stateManager.setState({ planetId: null, planetName: null })
            } else if (step === STEPS.PROCESS_PLANETS_LIST) {
                // stateIsUpdated = true;
                stateManager.prevStep();
            } else if (step === STEPS.PROCESS_TREASURE_ID) {
                // stateIsUpdated = true;
                stateManager.prevStep();
            }else if (step === STEPS.PROCESS_TREASURE) {
                // stateIsUpdated = true;
                stateManager.prevStep();
                stateManager.setState({ treasureItemId: null, treasureItemName: null })
            } else if (step === STEPS.PROCESS_TREASURES_LIST) {
                // stateIsUpdated = true;
                stateManager.prevStep();
            } else {
                //console.log(`UNKNOWN CLOSE BRACKET`)
            }
        } else {
            const removedBracket = this.bracketsStack.pop();
            tabs.pop();
            //console.log(`${tabs.join().replace(/,/g, '')} remove ${ removedBracket }\n`)
        }
    }

    _processHiddenItemName(step, chunk) {
        const stuffToSearch = chunk.split('=')[1];

        if (!stuffToSearch) return;

        const isRequiredItem = artifacts.required.find(x => x === stuffToSearch);
        const isWantedItem = artifacts.wanted.find(x => x === stuffToSearch);
        const isOptionalItem = artifacts.optional.find(x => x === stuffToSearch);

        let itemKey;
        const isItem = items.find(x => {
            itemKey = x;
            return stuffToSearch.indexOf(x) !== -1;
        });

        if (!(isRequiredItem || isWantedItem || isOptionalItem || isItem)) {
            return false;
        }

        //console.log(stateManager.getState().planetName);

        if (isItem) {
            if (!this.items[itemKey]) {
                this.items[itemKey] = [];
            }
            if (!this.items[itemKey][stuffToSearch]) {
                this.items[itemKey][stuffToSearch] = [];
            }
            const { starName, planetName } = stateManager.getState();
            this.items[itemKey][stuffToSearch].push({ starName, planetName });
        } else {
            const key = isRequiredItem ? 'required' :
                isWantedItem ? 'wanted' : 'optional';

            if (!this.artifacts[key]) {
                // this.summary[key] = {};
                this.artifacts[key] = {};
            }
            if (!this.artifacts[key][stuffToSearch]) {
                // this.summary[key][stuffToSearch] = 0;
                this.artifacts[key][stuffToSearch] = [];
            }
            const { starName, planetName } = stateManager.getState();
            this.summary[key][stuffToSearch] += 1;
            this.artifacts[key][stuffToSearch].push({ starName, planetName });
        }
        return true;
    }


    _processOpenBrackets(step, chunk) {
        this.bracketsStack.push(chunk);
        //console.log(`${tabs.join().replace(/,/g, '')} add ${ chunk }`)
        tabs.push('  ');
    }

    _processSave() {
        const logger = new LoggerService();

        for (const line of this.content) {
            let stateIsUpdated = false;

            const step = stateManager.getState().step;
            const oldState = JSON.parse(JSON.stringify(stateManager.getState()));

            if (line.indexOf(LINES.STAR_LIST) !== -1 && step === STEPS.NONE) {
                stateIsUpdated = true;
                this._processStarListRow(step, line);
            } else if (line.indexOf(LINES.STAR_ID) !== -1 && step === STEPS.PROCESS_STARS_LIST && line.indexOf('ICurStarId') === -1) {
                this._processStarId(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.STAR_NAME) !== -1 && step === STEPS.PROCESS_STAR) {
                this._processStarName(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.PLANET_LIST) !== -1 && step === STEPS.PROCESS_STAR) {
                this._processPlanetList(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.PLANET_ID) !== -1 && step === STEPS.PROCESS_PLANETS_LIST) {
                this._processPlanetId(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.PLANET_OWNER) !== -1) {

            } else if (line.indexOf(LINES.PLANET_NAME) !== -1 && step === STEPS.PROCESS_PLANET) {
                this._processPlanetName(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.PLANET_ECONOMY) !== -1 && step === STEPS.PROCESS_PLANET) {
                this._processPlanetEconomy(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.PLANET_TREASURE) !== -1 && step === STEPS.PROCESS_PLANET) {
                this._processPlanetTreasure();
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.HIDDEN_ITEM) !== -1 && step === STEPS.PROCESS_TREASURES_LIST && (line.indexOf('CreateNewHiddenItem') === -1)) {
                this._processTreasureId(step, line);
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.HIDDEN_ITEM_ID) !== -1 && step === STEPS.PROCESS_TREASURE) {
                this._processHiddenItem(step, line)
                stateIsUpdated = true;
            } else if (line.indexOf(LINES.HIDDEN_ITEM_NAME) !== -1 && step === STEPS.PROCESS_TREASURE_ID) {
                stateIsUpdated = this._processHiddenItemName(step, line);
                // if(!processesLeft) process.exit(0);
            } else if (line.indexOf(LINES.HIDDEN_ITEM_OWNER) !== -1 && false) {

            } else if (line.indexOf(LINES.HIDDEN_ITEM_SIZE) !== -1 && false) {

            } else if (line.indexOf(LINES.CLOSE_BRACKET) !== -1) {

                this._processCloseBrackets(step, line);
            } else if (line.indexOf(LINES.OPEN_BRACKET) !== -1) {

                this._processOpenBrackets(step, line);
            } else {
                stateIsUpdated = false;
            }


            const newState = stateManager.getState();

            if (stateIsUpdated) {
                // console.log(line);
                // processesLeft -= 1;
                logger.log(`${line}\nUpdate state from \n[${ JSON.stringify(oldState) }] to \n[${ JSON.stringify(newState) }]`);
                // console.log()
            }

            // if(processesLeft === 0) {
                // process.exit(0);
            // }
        }
    }

    async process(save) {
        this.content = await this.saveLoader.getLoadedSave(save);
        this._processSave();
    }
}


module.exports = SaveProcessorService;
