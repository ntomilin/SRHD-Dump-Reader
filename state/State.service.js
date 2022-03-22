const StepManager = require('./Step.service');

const config = require('../config.json');
const { artifacts, planets } = config;

class StateManager {
    #stepManager = new StepManager();

    #state = {
        step: this.#stepManager.getStep(),

        starId: null,
        starName: null,

        planetId: null,
        planetName: null,

        treasureItemId: null,
        treasureItemName: null,

        itemName: null,

        brackets: [],

        items: {},
        summary: {},
        artifacts: {
            required: {},
            wanted: {},
            optional: {},
        },
        planets: {
            [planets[0]]: null,
            [planets[1]]: null,
            [planets[2]]: null,
        },
    }

    constructor() {
        for (const key in artifacts) {
            if (!this.#state.summary[key]) {
                this.#state.summary[key] = {};
            }
            for (const art of artifacts[key]) {
                this.#state.summary[key][art] = 0;
            }
        }
    }

    getState() {
        return this.#state;
    }

    setState({ step, starId, planetId, treasureItemId, planetName, starName, treasureItemName }) {
        if (step !== undefined) {
            this.#state.step = step;
        }
        if (starId !== undefined) {
            this.#state.starId = starId;
        }
        if (planetId !== undefined) {
            this.#state.planetId = planetId;
        }
        if (treasureItemId !== undefined) {
            this.#state.treasureItemId = treasureItemId;
        }
        if (planetName !== undefined) {
            this.#state.planetName = planetName;
        }
        if (starName !== undefined) {
            this.#state.starName = starName;
        }
        if (treasureItemName !== undefined) {
            this.#state.treasureItemName = treasureItemName;
        }
    }

    nextStep() {
        const newStep = this.#stepManager.moveNextStep();
        this.updateStep(newStep);
    }

    prevStep() {
        const newStep = this.#stepManager.movePrevStep();
        this.updateStep(newStep);
    }

    updateStep(step) {
        const newState = { ...this.getState(), step };
        this.setState(newState);
    }
}

module.exports = {
    StateManager,
}
