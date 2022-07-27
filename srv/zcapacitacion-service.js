const cds = require('@sap/cds')
const circularJSON = require('circular-json')
const { TuitionCustom, Tuitions, Competitors } = cds.entities

/** Service implementation for CatalogService */
module.exports = cds.service.impl(srv => {
    srv.after('READ', 'TuitionCustom', (data) => _updateContentList(data));
    srv.on('CREATE', 'TuitionCustom', saveTuition);
    //Sobreescribir cualquier error desconocido
    srv.on("error", (err, req) => {
        console.info('error_reqx :: ', req.entity);
        let map = new Map();
        map.set('UNIQUE_CONSTRAINT_VIOLATION_ZcapacitacionService.Courses', 'Clave primaria de Curso duplicada');
        //map.set('UNIQUE_CONSTRAINT_VIOLATION_TuitionCustom', 'Clave primaria de matricula duplicada');   

        map.set('ENTITY_ALREADY_EXISTS_ZcapacitacionService.Courses', 'Un curso con el mismo nombre y nivel ya se encuentra registrado');
        //map.set('ENTITY_ALREADY_EXISTS_ZcapacitacionService.TuitionCustom', 'Dni que desea registrar ya esta asignado a otro Participante'); 

        switch (err.message) {
            case "UNIQUE_CONSTRAINT_VIOLATION":
                console.info('error_req_2 :: ');
                err.message = map.get(err.message + '_' + req.entity);
                break;
            case "ENTITY_ALREADY_EXISTS":
                console.info('error_req_3 :: ');
                err.message = map.get(err.message + '_' + req.entity);
                break;
            default:
                console.info('error_req_4 :: ');
                err.message =
                    "Se generó un error inesperado: " +
                    err.message;
                break;
        }

    });


});

/** Add some discount for overstocked books */
function _updateContentList(data) {
    console.debug('>>>x');
    const risks = Array.isArray(data) ? data : [data];
    console.info('>>>x_yz', risks);
    /*
    risks.forEach((risk) => {
      if (risk.impact >= 100000) {
        risk.criticality = 1;
      } else { 
        risk.criticality = 2;
      }
   });*/
}
/** Reduce stock of ordered books if available stock suffices */
async function saveTuition(req) {
    //const { Items: orderItems } = req.data
    let data = req.data;
    console.info('saveTuition_1: ', data);
    let ok = true, isNewParticipante = true;
    let code = '200', status = 200, message = 'Los datos se grabaron exitosamente';
    /*new Promise(function (resolve, reject) {
				
    }.bind(this)).then(
        function (actaConformidad) {
            
        }.bind(this),
        function (msg) {
            MessageBox.error("Se guardaron los datos pero sin una Acta de conformidad.");
        }
    );*/


    //Verificar si el participante es nuevo o ya existe
    if (!isEmpty(data.idCompetitor))
        isNewParticipante = false;
    if (await validateDni(req, isNewParticipante)) {
        console.info('saveTuition_2: ');
        //if (await validateFieldsKey(req, isNew)) {
        //console.info('saveTuition_3: ');
        const tx = cds.transaction(req);
        //const tx = cds.tx();
        //participante
        let participanteAux = {
            name: data.nameCompetitor,
            lastName: data.lastNameCompetitor,
            sex: data.sexCompetitor,
            documentNumber: data.documentNumberCompetitor,
            age: data.ageCompetitior,
            role: 'COMPETITOR',
            status: '1',
            masterProfesion_ID: data.idMasterProfesionCompetitor
        };
        //matricula
        let matriculaAux = {
            code: '000000',
            calendar_ID: data.idCalendar,
            competitor_ID: data.idCompetitor,
            status: '1'
        };
        //let aux;
        if (isNewParticipante) {//registrar Nuevo participante
            console.info('saveTuition_3: ');
            try {
                console.info('saveTuition_4 ');
                const [participanteOut] = await tx.run(INSERT.into(Competitors).entries(participanteAux));

                if (await validateTuition(req)) {
                    console.info('saveTuition_5 ');
                    matriculaAux.competitor_ID = participanteOut.ID;
                    if (isEmpty(data.ID)) {//Nueva matricula     
                        console.info('saveTuition_6 ');
                        await tx.run(INSERT.into(Tuitions).entries(matriculaAux));
                    } else {//Modificacion Matricula
                        console.info('saveTuition_7 ');
                        await tx.run(UPDATE(Tuitions).set(matriculaAux).where({ ID: data.ID }));
                    }

                } else {
                    console.info('saveTuition_8 ');
                    throw { "Error": "Ya el participante esta matriculado a este curso" };
                }
            } catch (error) {
                console.log('saveTuition_9: ');
                return req.reject(400, error);
            }

            console.log('saveTuition_10: ');
        } else {//Actualizar participante
            try {
                console.info('saveTuition_11: ');
                await tx.run(UPDATE(Competitors).set(participanteAux).where({ ID: data.idCompetitor }));

                if (await validateTuition(req)) {
                    console.log('saveTuition_12: ');
                    if (isEmpty(data.ID)) {//Nueva matricula
                        console.log('saveTuition_13: ');
                        await tx.run(INSERT.into(Tuitions).entries(matriculaAux));
                    } else {//Modificacion Matricula
                        console.log('saveTuition_14: ');
                        await tx.run(UPDATE(Tuitions).set(matriculaAux).where({ ID: data.ID }));
                    }
                } else {
                    console.log('saveTuition_15: ');
                    throw { "Error": "Ya el participante esta matriculado a este curso" };
                }
            } catch (error) {
                console.log('saveTuition_16: ');
                return req.error({ code: "409", message: error.Error, target: 'some_field', status: 409 });
            }
            console.log('saveTuition_17: ');

        }


        /*} else {//existe la combinacion con datos del participante
            console.info('saveTuition_6: ');
            code = '409';
            status = 409;
            message = 'Ya existe un participante registrado con ese nombre, genero y edad';
        }*/
    } else {//Existe un Participante con ese dni
        console.info('saveTuition_18: ');
        code = '409';
        status = 409;
        message = 'Ya existe un participante registrado con DNI: ' + data.documentNumberCompetitor;
    }
    if (code === '200') {
        console.info('saveTuition_19: ');
        req.info({
            code: code,
            message: message,
            target: 'some_field',
            status: status
        });
    } else {
        console.info('saveTuition_20: ');
        req.error({
            code: code,
            message: message,
            target: 'some_field',
            status: status
        });
    }



}

async function validateDni(req, isNew) {
    console.info('validateDni_1 :: ');
    let data = req.data;
    let dni = data.documentNumberCompetitor, idCompetitor = data.idCompetitor;

    let competitor = {};
    const tx = cds.transaction(req);
    if (isNew) {
        console.info('validateDni_2 :: ');
        competitor = await tx.run(SELECT.one.from(Competitors).where({ documentNumber: dni }));
    } else {
        console.info('validateDni_3 :: ');
        competitor = await tx.run(SELECT.one.from(Competitors).where`documentNumber = ${dni} AND ID <> ${idCompetitor}`);
    }

    console.info('validateDni_4 :: ', competitor);
    if (isEmpty(competitor)) {
        return true;
    }
    return false;


}

async function validateTuition(req) {
    console.info('validateTuition_1 :: ');
    let data = req.data;
    let idCompetitor = data.idCompetitor, idCalendar = data.idCalendar, idTuition = data.ID;

    let tuition = null;
    const tx = cds.transaction(req);
    if (isEmpty(idTuition)) {//Nueva matricula
        console.info('validateTuition_2 :: ');
        if (!isEmpty(idCompetitor)) {//si ya existe el participante
            console.info('validateTuition_3 :: ');
            tuition = await tx.run(SELECT.one.from(Tuitions).where`calendar_ID = ${idCalendar} AND competitor_ID = ${idCompetitor}`);
        }
    } else {//modificacion de matricula
        console.info('validateTuition_4 :: ');
        if (!isEmpty(idCompetitor)) {//si ya existe el participante
            console.info('validateTuition_5 :: ');
            tuition = await tx.run(SELECT.one.from(Tuitions).where`calendar_ID = ${idCalendar} AND competitor_ID = ${idCompetitor} AND ID <> ${idTuition}`);
        }
    }


    console.info('validateTuition_6 :: ', tuition);
    if (isEmpty(tuition)) {
        return true;
    }
    return false;
}



async function validateFieldsKey(req, isNew) {
    console.info('validateFieldsKey_0 :: ');
    let data = req.data;
    let idCompetitor = data.idCompetitor,
        name = data.nameCompetitor,
        lastName = data.lastNameCompetitor,
        sex = data.sexCompetitor,
        age = data.ageCompetitor;

    let competitor = {};
    const tx = cds.transaction(req);

    if (isNew) {
        console.info('validateFieldsKey_1 :: ');
        competitor = await tx.run(SELECT.one.from(Competitors).where({ name: name, lastName: lastName, sex: sex, age: age }));
    } else {
        console.info('validateFieldsKey_2 :: ');
        competitor = await tx.run(SELECT.one.from(Competitors).where`name = ${name} AND lastName = ${lastName} AND sex = ${sex} AND age = ${age} AND ID <> ${idCompetitor}`);
    }

    console.info('validateFieldsKey_3 :: ', competitor);
    if (isEmpty(competitor)) {
        return true;
    }
    return false;
}
function isEmpty(inputStr) {

    var flag = false;
    if (inputStr === '') {
        flag = true;
    }
    if (inputStr === null) {
        flag = true;
    }
    if (inputStr === undefined) {
        flag = true;
    }
    if (inputStr == null) {
        flag = true;
    }

    return flag;
}

