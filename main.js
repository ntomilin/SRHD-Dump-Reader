const SavesFilesService = require('./SavesFiles.service');
const SaveProcessor = require('./SaveProcessor.service');

const main = async () => {
    const saveFilesService = new SavesFilesService();
    const savesToHandle = await saveFilesService.getSavesNamesToProcess();

    savesToHandle.length = 1;

    for (let i = 0; i < savesToHandle.length; i += 1) {
        const save = savesToHandle[i];

        console.log(`${ save } (${ i }) PROCESSING...`)

        const saveProcessor = new SaveProcessor();
        await saveProcessor.process(save);

        //console.log(saveProcessor.allPlanetsAreIndustrial());

        if (saveProcessor.allPlanetsAreIndustrial()) {
            const state = saveProcessor.stateManager.getState();
            // console.dir(state, { depth: 3 });
            await saveFilesService.updateDb(save, state.items, state.artifacts, state.summary);
        } else {
            await saveFilesService.removeSaveFiles(save);
            console.log(`remove ${save}`);
        }

        console.log(`${ save } (${ i }) PROCESSED ${i + 1}/${savesToHandle.length}`)
    }
}

module.exports = main;
