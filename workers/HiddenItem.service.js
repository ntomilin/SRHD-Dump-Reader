const { PLANET_TREASURE, HIDDEN_ITEM, HIDDEN_ITEM_ID, HIDDEN_ITEM_NAME } = require('../constants/Lines');
const STEPS = require('../constants/Steps');
const { items, artifacts } = require('../config.json');

class HiddenItemService {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    canHandle(line) {
        const step = this.stateManager.getState().step;

        const { isTreasure, isHiddenItem, isHiddenItemId, isHiddenItemName } = this._getFlags(line, step);

        return isTreasure || isHiddenItem || isHiddenItemId || isHiddenItemName;
    }

    handle(line) {
        const step = this.stateManager.getState().step;

        const { isTreasure, isHiddenItem, isHiddenItemId, isHiddenItemName } = this._getFlags(line, step);

        if (isTreasure) {
            this._handleTreasure(line);
            return true;
        } else if (isHiddenItem) {
            this._handleTreasureItem(line);
            return true;
        } else if (isHiddenItemId) {
            this._handleTreasureItemId(line);
            return true;
        } else if (isHiddenItemName) {
            this._handleTreasureItemName(line);
            return true;
        } else {

        }
        return false;
    }

    _getFlags(line, step) {
        const isTreasure = line.indexOf(PLANET_TREASURE) !== -1 && step === STEPS.PROCESS_PLANET
        const isHiddenItem = line.indexOf(HIDDEN_ITEM) !== -1 && step === STEPS.PROCESS_TREASURES_LIST && (line.indexOf('CreateNewHiddenItem') === -1)
        const isHiddenItemId = line.indexOf(HIDDEN_ITEM_ID) !== -1 && step === STEPS.PROCESS_TREASURE
        const isHiddenItemName = line.indexOf(HIDDEN_ITEM_NAME) !== -1 && step === STEPS.PROCESS_TREASURE_ID

        return {
            isTreasure,
            isHiddenItem,
            isHiddenItemId,
            isHiddenItemName
        };
    }



    _handleTreasure() {
        this.stateManager.nextStep();
    }

    _handleTreasureItem(row) {
        const treasureItemId = row.split('=')[1];
        this.stateManager.nextStep();
        this.stateManager.setState({ treasureItemId });
    }

    _handleTreasureItemId(row) {
        this.stateManager.nextStep();
    }

    _handleTreasureItemName(row) {
        const state = this.stateManager.getState();
        const stuffToSearch = row.split('=')[1];

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

        if (isItem) {
            if (!state.items[itemKey]) {
                state.items[itemKey] = {};
            }
            if (!state.items[itemKey][stuffToSearch]) {
                state.items[itemKey][stuffToSearch] = [];
            }
            const { starName, planetName } = this.stateManager.getState();
            state.items[itemKey][stuffToSearch].push({ starName, planetName });
        } else {
            const key = isRequiredItem ? 'required' :
                isWantedItem ? 'wanted' : 'optional';

            if (!state.artifacts[key]) {
                state.artifacts[key] = {};
            }

            if (!state.artifacts[key][stuffToSearch]) {
                state.artifacts[key][stuffToSearch] = [];
            }

            const { starName, planetName } = this.stateManager.getState();
            state.summary[key][stuffToSearch] += 1;
            state.artifacts[key][stuffToSearch].push({ starName, planetName });
        }
    }
}

module.exports = HiddenItemService;
