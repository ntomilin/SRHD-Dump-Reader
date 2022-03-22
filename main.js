const SavesFilesService = require('./SavesFiles.service');
const SaveProcessor = require('./SaveProcessor.service');

const main = async () => {
    const saveFilesService = new SavesFilesService();
    const savesToHandle = await saveFilesService.getSavesNamesToProcess();

    for (let i = 0; i < savesToHandle.length; i += 1) {
        const save = savesToHandle[i];

        console.log(`${ save } (${ i }) PROCESSING...`)

        const saveProcessor = new SaveProcessor();
        await saveProcessor.process(save);

        let saveStatus = 'PROCESSED';

        if (saveProcessor.allPlanetsAreIndustrial()) {
            const state = saveProcessor.stateManager.getState();
            await saveFilesService.updateDb(save, state.items, state.artifacts, state.summary);
        } else {
            await saveFilesService.removeSaveFiles(save);
            saveStatus = 'REMOVED';
        }

        console.log(`${ save } (${ i }) ${saveStatus} ${i + 1}/${savesToHandle.length}`)
    }
}

module.exports = main;
