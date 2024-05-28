const {find} = require("shelljs");
const {writeFileSync,readFileSync} = require("fs");
const { convertDbTypes } = require("./convertHdbtableToCds");

let reportHdbfunctionFiles = [];
let reportHdbfunctionProxyCds = []
const reportHdbfunctionToCds = ()=>{
    return {reportHdbfunctionFiles,reportHdbfunctionProxyCds}
}

const dataTypesCleanUp = (type) =>{
    if(type.includes('))')) {
        return  type.replace(/\)$/, '').trim();
    }else if (type.includes('(') && type.includes(')')) {
        return type.trim()
    }else if(type.includes(')')){
        return type.split(')')[0].trim()
    }else{
        return type.trim()
    }
}

const convertToCds = (entity,inputParameter,returnTable) =>{
    if(returnTable && returnTable[0].type !== ''){
        let entityName = entity.replace(/::/g, '_').replace(/\./g, '_');
        let output = ""
        output += '@cds.persistence.exists\n'
        output += '@cds.persistence.udf\n'
        if (inputParameter.length == 0) {
          output += `entity ${entityName} {\n\t${returnTable.map(item => `${item.field.replace(/::/g, '_').replace(/\./g, '_')}: ${convertDbTypes(dataTypesCleanUp(item.type))}`).join(';\n\t')}\n}`
        } else {
          output += `entity ${entityName}(${inputParameter.map(item => `${item.field.replace(/::/g, '_').replace(/\./g, '_')}: ${convertDbTypes(dataTypesCleanUp(item.type))}`).join(', ')}) {\n\t${returnTable.map(item => `${item.field.replace(/::/g, '_').replace(/\./g, '_')}: ${convertDbTypes(dataTypesCleanUp(item.type))}`).join(';\n\t') + ';'}\n}`
        }
        return output
    }
}

const extractFieldAndTypes = (data)=>{

    data = data.toUpperCase().replace(/,\s*.*\s+TABLE.*\)\s+\)\s+(RETURNS)/is, ') ' + "$1");
    let splitEntity = data.match(/FUNCTION\s+"?([^"(]+)/)
    let entity = ''
    if(splitEntity){
        entity = splitEntity[1].replace(/\./g, '_').replace(/::/g, '_');
    }
    let pattern = /,(.*?TABLE.*?)RETURNS/s;
    let match = data.match(pattern);
    if(match){
        data = data.replace(match[1], ')');
    }
    let parametersString = data.substring(data.indexOf("(") + 1, data.toUpperCase().indexOf("RETURNS") - 2).trim();
    parametersString = parametersString.split(/,+(?![^()]*\))/).map(item => item.trim());
    let parameters = [];
    let regeular = /[^,()]+(?:\([^)]*\))?/g;
    let matches;

    while ((matches = regeular.exec(parametersString)) !== null) {
        parameters.push(matches[0].trim());
    }
    let inputParameter = parameters.filter(item => item && item !== ')')
    .map(item => {
           var temp = item.toUpperCase().replace(/IN\s+|DEFAULT\s+/g, '').replace("''",'').trim().split(/\s+/);
           if(temp[0] !== ''){
            return {field: temp[0], type: temp.slice(1).join(' ')};
           }
    })
    .filter(item => item);

    let cleanData = data.toUpperCase().replace(/[\n\s]{2,}/g, ' ');
    let returnTableDefStr = cleanData.split('RETURNS')[1].split('LANGUAGE')[0].split(' AS ')[0].replace(/TABLE\(/g, '').replace(/TABLE \(/g, '');
    let returnTableDef = returnTableDefStr.split(/,(?!\s*\d+\))/).map(item => item.trim());
    let returnTable = returnTableDef.map((item) =>{
        let result = item.trim().split(' ').map(item => item.trim());
        return {field: result[0].replace(/"/g, ''), type: result.slice(1).join('')}
    });
    return convertToCds(entity,inputParameter,returnTable)
}


const convertHdbfunctionToCds = (directory, extension) => {
    try {
        const files = find(directory).filter((file) => file.endsWith(extension));
        let proxyCdsArray = []
        files.forEach(file => {
            let pattern = /,(.*?TABLE.*?)RETURNS/s;
            let data = readFileSync(file, "utf8");
            data = data.toUpperCase()
            if(!data.match(pattern)){
                reportHdbfunctionFiles.push(file)
                const convertedData = extractFieldAndTypes(data);
                if(convertedData) proxyCdsArray.push(convertedData)
            }
        });
        if(proxyCdsArray.length > 0){ 
            reportHdbfunctionProxyCds.push('Proxy_Hdbfunction.cds')
            writeFileSync('Proxy_Hdbfunction.cds', proxyCdsArray.join('\n\n'))
        }
    } catch (error) {
        console.error(`Error converting hdbfunction to cds: ${error}`);
    }
};

module.exports = {convertHdbfunctionToCds,reportHdbfunctionToCds}