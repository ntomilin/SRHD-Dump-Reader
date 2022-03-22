const STEPS = require('../constants/Steps');

class StepManager {
    #steps = Object.freeze(Object.keys(STEPS));

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

module.exports = StepManager;
