const cds = require('@sap/cds')
const { MasterProfesions, MasterLevels, MasterFrequences, MasterModalitys, MasterData } = cds.entities

/** Service implementation for CatalogService */
module.exports = cds.service.impl(srv => {
    srv.after('READ', 'MasterData', _updateContentList);

});

/** Add some discount for overstocked books */
async function _updateContentList(data) {
    console.debug('_updateContentList_1 :: ', data);
    let listMaster = Array.isArray(data) ? data : [data];
    
    //const tx = cds.transaction(req);
    //const listMasterLevel = await tx.run(SELECT.from(MasterLevels));kkk
    const listMasterLevel = await SELECT.from(MasterLevels);    
    const listMasterModalitys = await SELECT.from(MasterModalitys);
    const listMasterFrequences = await SELECT.from(MasterFrequences);
    listMaster.forEach((ele) => {
        ele.groupMaster = 'MasterProfesions';
    });

    listMasterLevel.forEach((ele) => {
        let objAux = { ID: ele.ID, description: ele.description, groupMaster: 'MasterLevels' };
        listMaster.push(objAux);
    });

    listMasterModalitys.forEach((ele) => {
        let objAux = { ID: ele.ID, description: ele.description, groupMaster: 'MasterModalitys' };
        listMaster.push(objAux);
    });

    listMasterFrequences.forEach((ele) => {
        let objAux = { ID: ele.ID, description: ele.description, groupMaster: 'MasterFrequences' };
        listMaster.push(objAux);
    });


    console.info('_updateContentList_dos :: ', data);
}

