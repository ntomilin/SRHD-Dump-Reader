const STEPS = {
    NONE: 'NONE',
    PROCESS_STARS_LIST: 'PROCESS_STARS_LIST',
    PROCESS_STAR: 'PROCESS_STAR',
    PROCESS_PLANETS_LIST: 'PROCESS_PLANETS_LIST',
    PROCESS_PLANET: 'PROCESS_PLANET',
    PROCESS_TREASURES_LIST: 'PROCESS_TREASURES_LIST',
    PROCESS_TREASURE: 'PROCESS_TREASURE',
    PROCESS_TREASURE_ID: 'PROCESS_TREASURE_ID',
};


class StepManager {
    #steps = Object.freeze([
        STEPS.NONE,
        STEPS.PROCESS_STARS_LIST,
        STEPS.PROCESS_STAR,
        STEPS.PROCESS_PLANETS_LIST,
        STEPS.PROCESS_PLANET,
        STEPS.PROCESS_TREASURES_LIST,
        STEPS.PROCESS_TREASURE,
        STEPS.PROCESS_TREASURE_ID,
    ]);

    #stepCounter = 0;

    getStep() {
        return this.#steps[this.#stepCounter];
    }

    moveNextStep() {
        if (this.#stepCounter + 1 >= this.#steps.length) {
            throw new Error('Step counter moved over steps length')
        }

        this.#stepCounter += 1;
        return this.#steps[this.#stepCounter];
    }

    movePrevStep() {
        if (this.#stepCounter - 1 < 0) {
            throw new Error('Step counter less than 0')
        }

        this.#stepCounter -= 1;
        return this.#steps[this.#stepCounter];
    }
}

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
    }

    getState() {
        return this.#state;
    }

    setState({ step, starId, planetId, treasureItemId, planetName, starName, treasureItemName }) {
        if (step !== undefined) { this.#state.step = step; }
        if (starId !== undefined) { this.#state.starId = starId; }
        if (planetId !== undefined) { this.#state.planetId = planetId; }
        if (treasureItemId !== undefined) { this.#state.treasureItemId = treasureItemId; }
        if (planetName !== undefined) { this.#state.planetName = planetName; }
        if (starName !== undefined) { this.#state.starName = starName; }
        if (treasureItemName !== undefined) { this.#state.treasureItemName = treasureItemName; }
    }

    nextStep() {
        const newStep = this.#stepManager.moveNextStep();
        this.updateState(newStep);
    }

    prevStep() {
        const newStep = this.#stepManager.movePrevStep();
        this.updateState(newStep);
    }

    updateState(step) {
        const newState = this.computeState(step);
        this.setState(newState);
    }

    computeState(step) {
        const stateCopy = {...this.getState(), step};
        return stateCopy;
    }
}

module.exports = {
    StateManager,
    STEPS,
}
