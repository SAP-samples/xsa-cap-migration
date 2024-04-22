const shell = require("shelljs");
const xml2js = require("xml2js");
const {readFileSync,writeFileSync,appendFileSync} = require('fs');
const {hanaDbConnection, disconnectConnection} = require('./hanaDbConnection');
const { convertDbTypes } = require("./convertHdbtableToCds");

const convertToProxyCds = (data,destination) =>{
    let indexContent = "";
    const originalDir = process.cwd();
    process.chdir(destination + "/cds");
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
                writeFileSync(`${entityName}.cds`, finalResult);
            }
        }
    }
    try {
        process.chdir(destination);
        appendFileSync('index.cds', indexContent,"utf8");
        console.log('Data has been appended!');
    } catch (err) {
        console.error(err);
    }
    process.chdir(originalDir);
}

const executeQuery = async (query,connection) => {
    return new Promise((resolve, reject) => {
        connection.exec(query, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};

const combinedOutput = async (connection,calViewIds,destination) =>{
    try {
        const combinedOutput = {};
        for (const id of calViewIds) {
            const outputForId = {};
            const sqlQueryDimensionView = `SELECT COLUMN_NAME, COLUMN_SQL_TYPE FROM _SYS_BI.BIMC_DIMENSION_VIEW WHERE QUALIFIED_NAME = '${id}'`;
            const sqlQueryVariableView = `SELECT VARIABLE_NAME, COLUMN_SQL_TYPE FROM _SYS_BI.BIMC_VARIABLE_VIEW WHERE QUALIFIED_NAME = '${id}'`;
            try {
                outputForId.dimensionView = await executeQuery(sqlQueryDimensionView,connection);
            } catch (err) {
                console.error('Error executing dimension view query for ID', id, err);
                continue; 
            }
            try {
                outputForId.variableView = await executeQuery(sqlQueryVariableView,connection);
            } catch(err) {
                console.error('Error executing variable view query for ID', id, err);
                continue;
            }
            combinedOutput[id] = outputForId;
        }
        disconnectConnection()
        convertToProxyCds(combinedOutput,destination)
        
    } catch (error) {
        console.error('Unanticipated Error processing DB:', error);
    }
}

const convertCalcviewToCds =  async(directory, extension,destination) => {
    try {
        const files = shell.find(directory).filter((file) => file.endsWith(extension));
        const calViewIds = []
        if(files.length > 0){
            for (const file of files) {
                let xmlString = readFileSync(file, "utf8");
                const parser = new xml2js.Parser();
                parser.parseString(xmlString, (err, result) => {
                    if (err)  console.error('Error occurred: ', err);
                    const id =  result['Calculation:scenario'].$.id
                    calViewIds.push(id);
                });
            }
            const connection = await hanaDbConnection()
            combinedOutput(connection,calViewIds,destination)
        }
    } catch (err) {
    console.error('Error processing files:', err);
    }
}; 

module.exports = convertCalcviewToCds

