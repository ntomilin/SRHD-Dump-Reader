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

    PLANET_TREASURE: 'Treasure ^{', // PROCESS_TREASURES_LIST

    HIDDEN_ITEM: 'HiddenItem', // PROCESS_TREASURE
    HIDDEN_ITEM_ID: 'ItemId',
    HIDDEN_ITEM_NAME: 'IName',
    HIDDEN_ITEM_OWNER: 'Owner',
    HIDDEN_ITEM_SIZE: 'Size',

    OPEN_BRACKET: '^{',
    CLOSE_BRACKET: '}' // previous step
};

module.exports = LINES;
