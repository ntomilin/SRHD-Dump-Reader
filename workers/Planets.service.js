const { PLANET_LIST, PLANET_ID, PLANET_NAME, PLANET_ECONOMY } = require('../constants/Lines')
const STEPS = require('../constants/Steps');

class PlanetsService {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    canHandle(line) {
        const step = this.stateManager.getState().step;

        const { isPlanetList, isPlanetId, isPlanetName, isPlanetEconomy } = this._getFlags(line, step);

        return isPlanetList || isPlanetId || isPlanetName || isPlanetEconomy;
    }

    handle(line) {
        const step = this.stateManager.getState().step;

        const { isPlanetList, isPlanetId, isPlanetName, isPlanetEconomy } = this._getFlags(line, step)

        if (isPlanetList) {
            this._handlePlanetList(line);
            return true;
        } else if (isPlanetId) {
            this._handlePlanetId(line);
            return true;
        } else if (isPlanetName) {
            this._handlePlanetName(line);
            return true;
        } else if (isPlanetEconomy) {
            this._handlePlanetEconomy(line);
            return true;
        } else {

        }
        return false;
    }

    _getFlags(line, step) {
        const isPlanetList = line.indexOf(PLANET_LIST) !== -1 && step === STEPS.PROCESS_STAR
        const isPlanetId = line.indexOf(PLANET_ID) !== -1 && step === STEPS.PROCESS_PLANETS_LIST
        const isPlanetName = line.indexOf(PLANET_NAME) !== -1 && step === STEPS.PROCESS_PLANET
        const isPlanetEconomy = line.indexOf(PLANET_ECONOMY) !== -1 && step === STEPS.PROCESS_PLANET

        return { isPlanetList, isPlanetId, isPlanetName, isPlanetEconomy };
    }


    _handlePlanetList() {
        this.stateManager.nextStep();
    }

    _handlePlanetId(line) {
        this.stateManager.nextStep();

        const rgxMatch = line.match(/[\d]+/);
        if (!rgxMatch) return;

        const planetId = rgxMatch[0];
        this.stateManager.setState({ planetId });
    }

    _handlePlanetName(line) {
        const planetName = line.split('=')[1];
        this.stateManager.setState({ planetName });
    }

    _handlePlanetEconomy(line) {
        const state = this.stateManager.getState();

        if (state.planets[state.planetName] === null) {
            state.planets[state.planetName] = line.split('=')[1];
        }
    }
}

module.exports = PlanetsService;
