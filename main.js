const SavesFilesService = require('./SavesFiles.service');
const SaveProcessor = require('./SaveProcessor.service');

const main = async () => {
    const saveFilesService = new SavesFilesService();
    const savesToHandle = await saveFilesService.getSavesNamesToProcess();

    // savesToHandle.length = 1;

    for (let i = 0; i < savesToHandle.length; i += 1) {
        const save = savesToHandle[i];

        console.log(`${ save } (${ i }) PROCESSING`)

        const saveProcessor = new SaveProcessor();
        await saveProcessor.process(save);
        //console.log(saveProcessor.planets)
        //console.log(saveProcessor.allPlanetsAreIndustrial())
        saveFilesService.addProcessedSave(save)

        if (!saveProcessor.allPlanetsAreIndustrial()) {
            //console.log(`remove ${save}`);
            await saveFilesService.removeSaveFiles(save);
            // process.exit(0);
        }

        // process.exit(0);

        console.log(`${ save } (${ i }) PROCESSED\n`)
    }
}

module.exports = main;
