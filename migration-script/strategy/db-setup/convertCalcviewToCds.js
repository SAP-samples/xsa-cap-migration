const shell = require("shelljs");
const xml2js = require("xml2js");
const {readFileSync,writeFileSync,appendFileSync} = require('fs');
const { convertDbTypes } = require("./convertHdbtableToCds");
const { connection } = require("../../config/hanaDbConnection");

let reportHdbcalculationFiles = []
let reportCalcCdsFiles = []

const reportHdbcalculationToCds = () =>{
    return {reportHdbcalculationFiles,reportCalcCdsFiles}
}

const convertToProxyCds = (data) =>{
    let indexContent = "";
    for (let key in data) {
        if(data[key].variableView.length > 0 || data[key].dimensionView.length > 0 ){
            let output = "";
            let entityName = key.replace(/::/g, '_').replace(/\./g, '_').toUpperCase()
            output += `@cds.persistence.exists\n@cds.persistence.calcview\nentity ${entityName} `;
            if (data[key].variableView && data[key].variableView.length > 0) {
                output += "(";
                data[key].variableView.forEach((variable, index) => {
                if (index !== 0) { 
                    output += ", ";
                }
                output += `${variable.VARIABLE_NAME} : ${convertDbTypes(variable.COLUMN_SQL_TYPE)}`;
                });
                output += ") ";
            }
            output += "{\n";
            data[key].dimensionView.forEach((dim) => {
                output += `    ${dim.COLUMN_NAME} : ${convertDbTypes(dim.COLUMN_SQL_TYPE)};\n`;
            });
            output += "};\n\n";
            let finalResult = typeof output === 'string' ? output : JSON.stringify(output, null, 2);
            if(finalResult.length > 0) {
                indexContent = indexContent.concat(`using from './cds/${entityName}';\n`);
                reportCalcCdsFiles.push(`${entityName}.cds`)
                writeFileSync(`${entityName}.cds`, finalResult);
            }
        }
    }
}

const executeQuery = async (query) => {
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const removeDuplicateFields = (obj) => {
    let clone = JSON.parse(JSON.stringify(obj));
    const removeDuplicates = (obj) => {
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                let jsonString = new Set();
                obj[key] = obj[key].filter((fieldObj) => {
                    let stringified = JSON.stringify(fieldObj);
                    if (!jsonString.has(stringified)) {
                        jsonString.add(stringified);
                        return true;
                    }
                    return false;
                });
            } else {
                removeDuplicates(obj[key]);
            }
        }
    }
    removeDuplicates(clone);
    return clone;
}

const combinedOutput = async (calViewIds) =>{
    try {
        const combinedOutputObj = {};
        for (const id of calViewIds) {
            const outputForId = {};
            const sqlQueryDimensionView = `SELECT COLUMN_NAME, COLUMN_SQL_TYPE FROM _SYS_BI.BIMC_DIMENSION_VIEW WHERE QUALIFIED_NAME = '${id}'`;
            const sqlQueryVariableView = `SELECT VARIABLE_NAME, COLUMN_SQL_TYPE FROM _SYS_BI.BIMC_VARIABLE_VIEW WHERE QUALIFIED_NAME = '${id}'`;
            try {
                outputForId.dimensionView = await executeQuery(sqlQueryDimensionView);
            } catch (err) {
                console.error('Error executing dimension view query for ID', id, err);
                continue; 
            }
            try {
                outputForId.variableView = await executeQuery(sqlQueryVariableView);
            } catch(err) {
                console.error('Error executing variable view query for ID', id, err);
                continue;
            }
            combinedOutputObj[id] = outputForId;
        }
        return combinedOutputObj;
        
    } catch (error) {
        console.error('Unanticipated Error processing DB:', error);
    }
}

const convertCalcviewToCds =  async(directory, extension) => {
    try {
        const files = shell.find(directory).filter((file) => file.endsWith(extension));
        const calViewIds = []
        if(files.length > 0){
            for (const file of files) {
                reportHdbcalculationFiles.push(file.split('/').pop())
                let xmlString = readFileSync(file, "utf8");
                const parser = new xml2js.Parser();
                parser.parseString(xmlString, (err, result) => {
                    if (err)  console.error('Error occurred: ', err);
                    const id =  result['Calculation:scenario'].$.id
                    calViewIds.push(id);
                });
            }
            const combinedOutputObj = await combinedOutput(calViewIds)
            convertToProxyCds(removeDuplicateFields(combinedOutputObj))
        }
    } catch (err) {
        console.error('Error processing files:', err);
    }
}; 

module.exports = {convertCalcviewToCds,reportHdbcalculationToCds,convertToProxyCds,removeDuplicateFields,executeQuery}

