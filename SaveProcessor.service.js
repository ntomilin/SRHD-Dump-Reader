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
let k = 150;

const { StateManager, STEPS } = require('./state')
const stateManager = new StateManager();

let processesLeft = 50;

const planets = require('./config.json').planets;
let tabs = [];


class SaveProcessorService {

    constructor() {
        this.saveLoader = new SaveLoaderService();
    }

    content = [];

    bracketsStack = [];

    items = [];
    artifacts = [];
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
        if(!rgxMatch) return;

        const starId = rgxMatch[0];
        stateManager.setState({ starId });
    }
    _processStarName = (step, chunk) => {
        // stateManager.nextStep();
        const starName = chunk.split('=')[1];
        stateManager.setState({ starName });
    }

    _processPlanetList(step, chunk) {
        stateManager.nextStep();
    }

    _processPlanetId(ste, chunk) {
        stateManager.nextStep();

        const rgxMatch = chunk.match(/[\d]+/);
        if(!rgxMatch) return;

        const planetId = rgxMatch[0];
        stateManager.setState({ planetId });
    }


    _processPlanetName = (step, chunk) => {
        const planetName = chunk.split('=')[1];
        //console.log(planetName)
        stateManager.setState({ planetName });
    }

    _processSave() {
        for (const line of this.content) {
            let stateIsUpdated = false;

            const step = stateManager.getState().step;
            const oldState = JSON.parse(JSON.stringify(stateManager.getState()));

            if(line.indexOf(LINES.STAR_LIST) !== -1 && step === STEPS.NONE) {
                stateIsUpdated = true;
                this._processStarListRow(step, line);
            } else if(line.indexOf(LINES.STAR_ID) !== -1 && step === STEPS.PROCESS_STARS_LIST) {
                stateIsUpdated = true;
                this._processStarId(step, line);
            } else if(line.indexOf(LINES.STAR_NAME) !== -1 && step === STEPS.PROCESS_STAR) {
                stateIsUpdated = true;
                this._processStarName(step, line);
            } else if(line.indexOf(LINES.PLANET_LIST) !== -1 && step === STEPS.PROCESS_STAR) {
                stateIsUpdated = true;
                this._processPlanetList(step, line);
            } else if(line.indexOf(LINES.PLANET_ID) !== -1 && step === STEPS.PROCESS_PLANETS_LIST) {
                stateIsUpdated = true;
                this._processPlanetId(step, line);
            } else if(line.indexOf(LINES.PLANET_OWNER) !== -1) {

            } else if(line.indexOf(LINES.PLANET_NAME) !== -1 && step === STEPS.PROCESS_PLANET) {
                stateIsUpdated = true;
                this._processPlanetName(step, line);
            } else if(line.indexOf(LINES.PLANET_ECONOMY) !== -1 && step === STEPS.PROCESS_PLANET) {
                if (this.planets[stateManager.getState().planetName] === null) {
                    this.planets[stateManager.getState().planetName] = line.split('=')[1];
                }
            } else if(line.indexOf(LINES.PLANET_TREASURE) !== -1 && false) {

            } else if(line.indexOf(LINES.HIDDEN_ITEM) !== -1 && false) {

            } else if(line.indexOf(LINES.HIDDEN_ITEM_ID) !== -1 && false) {

            } else if(line.indexOf(LINES.HIDDEN_ITEM_NAME) !== -1 && false) {

            } else if(line.indexOf(LINES.HIDDEN_ITEM_OWNER) !== -1 && false) {

            } else if(line.indexOf(LINES.HIDDEN_ITEM_SIZE) !== -1 && false) {

            } else if(line.indexOf(LINES.CLOSE_BRACKET) !== -1) {
                if(this.bracketsStack.length === 0) {
                    if (step === STEPS.PROCESS_STAR) {
                        stateIsUpdated = true;
                        stateManager.prevStep();
                        stateManager.setState({ starId: null, starName: null })
                    } else if (step === STEPS.PROCESS_PLANET) {
                        stateIsUpdated = true;
                        stateManager.prevStep();
                        stateManager.setState({ planetId: null, planetName: null })
                    } else if (step === STEPS.PROCESS_PLANETS_LIST) {
                        stateIsUpdated = true;
                        stateManager.prevStep();
                    } else if (step === STEPS.PROCESS_TREASURE) {
                        stateIsUpdated = true;
                        stateManager.prevStep();
                        stateManager.setState({ treasureItemId: null, treasureItemName: null })
                    } else if (step === STEPS.PROCESS_TREASURES_LIST) {
                        stateIsUpdated = true;
                        stateManager.prevStep();
                    }else {
                        //console.log(`UNKNOWN CLOSE BRACKET`)
                    }
                } else {
                    const removedBracket = this.bracketsStack.pop();
                    tabs.pop();
                    //console.log(`${tabs.join().replace(/,/g, '')} remove ${ removedBracket }\n`)
                }
            } else {
                //console.log(`line [${line}], open bracket = ${line.indexOf(LINES.OPEN_BRACKET) !== -1}`);
                if(line.indexOf(LINES.OPEN_BRACKET) !== -1) {
                    this.bracketsStack.push(line);
                   //console.log(`${tabs.join().replace(/,/g, '')} add ${ line }`)
                    tabs.push('  ');
                } else {
                    stateIsUpdated = false;
                }
            }

            const newState = stateManager.getState();

            if(stateIsUpdated) {
                //console.log(line);
                //processesLeft -= 1;
                //console.log(`Update state from \n[${ JSON.stringify(oldState) }] to \n[${ JSON.stringify(newState) }]\n\n`)
            }

            // if(processesLeft === 0) {
            //     process.exit(0);
            // }
        }
    }

    async process(save) {
        this.content = await this.saveLoader.getLoadedSave(save);
        this._processSave();
    }
}

/*
* ShipList ^{
* ShipId1856 ^{
* Health ^{
* EqList ^{
* ItemId112890 ^{
* */

module.exports = SaveProcessorService;
