const { STAR_LIST, STAR_ID, STAR_NAME } = require('../constants/Lines');
const STEPS = require("../constants/Steps");

class StarService {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    canHandle(line) {
        const step = this.stateManager.getState().step;

        const { isStarList, isStarId, isStarName } = this._getFlags(line, step);

        return isStarList || isStarId || isStarName;
    }

    handle(line) {
        const step = this.stateManager.getState().step;

        const { isStarList, isStarId, isStarName } = this._getFlags(line, step);

        if (isStarList) {
            this._handleStarList(line);
            return true;
        } else if (isStarId) {
            this._handleStarId(line);
            return true;
        } else if (isStarName) {
            this._handleStarName(line);
            return true;
        } else {

        }

        return false;
    }

    _getFlags(line, step) {
        const isStarList = line.indexOf(STAR_LIST) !== -1 && step === STEPS.NONE;
        const isStarId = line.indexOf(STAR_ID) !== -1 && step === STEPS.PROCESS_STARS_LIST && line.indexOf('ICurStarId') === -1;
        const isStarName = line.indexOf(STAR_NAME) !== -1 && step === STEPS.PROCESS_STAR;

        return { isStarId, isStarList, isStarName };
    }


    _handleStarList() {
        this.stateManager.nextStep();
    }

    _handleStarId(row) {
        try {
            this.stateManager.nextStep();

            const rgxMatch = row.match(/[\d]+/);

            if (!rgxMatch) return;

            const starId = rgxMatch[0];
            this.stateManager.setState({ starId });
        } catch (err) {
            console.log(row);
            console.log(err);
        }
    }

    _handleStarName(row) {
        const starName = row.split('=')[1];
        this.stateManager.setState({ starName });
    }
}

module.exports = StarService;
