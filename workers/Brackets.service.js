const { CLOSE_BRACKET, OPEN_BRACKET } = require('../constants/Lines');
const STEPS = require('../constants/Steps');

class BracketsService {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.bracketsStack = [];
    }

    canHandle(line) {
        const { isCloseBracket, isOpenBracket } = this._getFlags(line)

        return isCloseBracket || isOpenBracket;
    }

    handle(line) {
        const step = this.stateManager.getState().step;

        const isCloseBracket = line.indexOf(CLOSE_BRACKET) !== -1;
        const isOpenBracket = line.indexOf(OPEN_BRACKET) !== -1;

        if (isCloseBracket) {
            this._handleCloseBracket(step);
        } else if (isOpenBracket) {
            this._handleOpenBracket(line);
        } else {

        }
        return false;
    }

    _getFlags(line) {
        const isCloseBracket = line.indexOf(CLOSE_BRACKET) !== -1;
        const isOpenBracket = line.indexOf(OPEN_BRACKET) !== -1;

        return { isCloseBracket, isOpenBracket };
    }



    _handleCloseBracket(step) {
        if (this.bracketsStack.length === 0) {
            if (step === STEPS.PROCESS_STAR) {
                this.stateManager.prevStep();
                this.stateManager.setState({ starId: null, starName: null })
            } else if (step === STEPS.PROCESS_PLANET) {
                this.stateManager.prevStep();
                this.stateManager.setState({ planetId: null, planetName: null })
            } else if (step === STEPS.PROCESS_PLANETS_LIST) {
                this.stateManager.prevStep();
            } else if (step === STEPS.PROCESS_TREASURE_ID) {
                this.stateManager.prevStep();
            }else if (step === STEPS.PROCESS_TREASURE) {
                this.stateManager.prevStep();
                this.stateManager.setState({ treasureItemId: null, treasureItemName: null })
            } else if (step === STEPS.PROCESS_TREASURES_LIST) {
                this.stateManager.prevStep();
            } else {

            }
        } else {
            const row = this.bracketsStack.pop();
        }
    }

    _handleOpenBracket(row) {
        this.bracketsStack.push(row);
    }
}

module.exports = BracketsService;
