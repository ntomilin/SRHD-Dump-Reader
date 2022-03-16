const SavesFilesService = require('./SavesFiles.service');
const SaveProcessor = require('./SaveProcessor.service');

const main = async () => {
    const saveFilesService = new SavesFilesService();
    const savesToHandle = await saveFilesService.getSavesNamesToProcess();

    // savesToHandle.length = 1;
    // savesToHandle[0] = 'autodump20220308-091105'

    for (let i = 0; i < savesToHandle.length; i += 1) {
        const save = savesToHandle[i];

        console.log(`${ save } (${ i }) PROCESSING...`)

        const saveProcessor = new SaveProcessor();
        await saveProcessor.process(save);
        // saveFilesService.addProcessedSave(save)

        if (!saveProcessor.allPlanetsAreIndustrial()) {
            console.log(`remove ${save}`);
            await saveFilesService.removeSaveFiles(save);
        } else {
            await saveFilesService.updateDb(save, saveProcessor.items, saveProcessor.artifacts, saveProcessor.summary);
        }

        console.log(`${ save } (${ i }) PROCESSED ${i + 1}/${savesToHandle.length}`)
    }
}

module.exports = main;
