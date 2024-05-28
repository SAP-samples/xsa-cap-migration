const {writeFileSync,readFileSync} = require("fs");
const shell = require("shelljs");
const  {format} = require('sql-formatter')


let reportHdbtableFiles = []
let reportCdsFiles = []
let reportSynonymFile = []


const reportHdbtableToCds = () =>{
  return {reportHdbtableFiles,reportCdsFiles,reportSynonymFile}
}

const convertHdbtableToCds = (directory, extension) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(extension));
    let proxyCdsArray = []
    let proxySynonymArray = []
    files.forEach(file => {
      reportHdbtableFiles.push(file.split('/').pop())
      let data = readFileSync(file, "utf8");
      let { newFileContent, planeColumnQuotedTable} = convertToCds(data);
      if(newFileContent) proxyCdsArray.push(newFileContent);
      if(planeColumnQuotedTable) proxySynonymArray.push(planeColumnQuotedTable);
    });
    if(proxyCdsArray.length > 0){ 
      writeFileSync('Proxy_Table.cds', proxyCdsArray.join('\n\n'))
      reportCdsFiles.push("Proxy_Table.cds")
    }
    if(proxySynonymArray.length > 0) { 
      let jsonString = proxySynonymArray.join(",\n"); 
      let result = '{\n' + jsonString + '\n}';      
      writeFileSync('src/Proxy_Table.hdbsynonym', result); 
      reportSynonymFile.push("Proxy_Table.hdbsynonym")
  }
  } catch (error) {
    console.error(`Error converting Hdbtable to cds: ${error}`);
  }
};

const isValidJoinLine = (line) => {
  return line.includes("JOIN") && line.includes("AS") && line.includes("ON") && line.includes("=");
}

const isValidManyJoinLine = (line) => {
  return (line.includes("MANY TO ONE JOIN") || line.includes("MANY TO MANY JOIN")) && line.includes("AS") && line.includes("ON") && line.includes("=");
}

const convertSqlToAssociation = (sqlString) => {
  if(isValidManyJoinLine(sqlString)){
    let associations  = sqlString.trim().replace(/\)\)+WITH ASSOCIATIONS \((?=\s*MANY)/, "").replace(/\),$/g, ")").replace(/\(/g, "").replace(/\)/g, "").split(/\s*,\s*JOIN\s+/);
    return associations.map((line) => {
      let asIndex = line.indexOf(' AS ');
      let onIndex = line.indexOf(' ON ');
      
      let table = line.substring(line.indexOf('JOIN') + 4, asIndex).trim().replace(/\./g, '_').replace(/::/g, '_').replace(/"/g, '').toUpperCase();
      let alias = line.substring(asIndex + 3, onIndex).trim().replace(/"/g, '').toUpperCase();
      let rightId = line.substring(onIndex+ 3).trim().replace(/"/g, '').replace(/,/g, '').toUpperCase();       
      let associationType = line.includes("MANY TO MANY JOIN") ? "Association to many" : "Association to";
 
      return `${alias} : ${associationType} ${table} on ${rightId};`;    
    });
  }else if(isValidJoinLine(sqlString)){
      let associations = sqlString.trim().replace(/^WITH ASSOCIATIONS\(\s*JOIN\s+/, "").replace(/\)\s*$/, "").split(/\s*,\s*JOIN\s+/);
      return associations.map((line)=>{
          let asIndex = line.indexOf("AS");
          let onIndex = line.indexOf("ON");
          let equalsIndex = line.indexOf("=");
  
          let table = line.substring(0, asIndex).replace(/"/g, '').replace(/JOIN/g, '').trim().replace(/\./g, '_').replace(/::/g, '_').toUpperCase();
          let alias = line.substring(asIndex + 2, onIndex).replace(/\./g, '_').trim().replace(/"/g, '').toUpperCase();
          let rightEleemnt  = line.substring(equalsIndex + 1).trim().replace(/"/g, '').replace(/\./g, '_').replace(/,/g, '').toUpperCase();
          let rightId = rightEleemnt.split("_").pop()
          if(rightEleemnt.includes("_")){
            return `${alias}:Association to ${table} on ${alias}.${rightId} = $self.${alias}_${rightId};`;
          }
          return `${alias}:Association to ${table} on ${rightId} = $self.${rightId};`;
      })
  }
}

const dataTypesCleanUp = (type) =>{
  if (type.includes('(') && type.includes(')')) {
    return type; 
  } else {
    return type.split('(')[0].replace(',', ''); 
  }
}
 
const convertDbTypes = (types) => {

  types = dataTypesCleanUp(types)
  let match = types.match(/\(([^)]+)\)/);
  if (match) {
    switch (true) {
      case types.startsWith('DECIMAL'):
        return `Decimal(${match[1].trim()})`;
      case types.startsWith('NVARCHAR'):
        return `String(${match[1].trim()})`;
      case types.startsWith('VARCHAR'):
        return `hana.VARCHAR(${match[1].trim()})`;
      case types.startsWith('ST_POINT'):
        return `hana.ST_POINT(${match[1].trim()})`;
      case types.startsWith('ST_GEOMETRY'):
        return `hana.ST_GEOMETRY(${match[1].trim()})`;
    }
  }
  switch (types) {
    case 'BOOLEAN':
      return 'Boolean';
    case 'DECIMAL':
      return 'Decimal';
    case 'NVARCHAR':
    case 'STRING' :
      return 'String';
    case 'INTEGER':
    case 'INT':
      return 'Integer';
    case 'TINYINT':
      return 'hana.TINYINT'
    case 'SMALLINT':
      return 'hana.SMALLINT';
    case 'MEDIUMINT':
      return 'Int32';
    case 'BIGINT':
      return 'Integer64';
    case 'NUMERIC':
    case 'FLOAT':
    case 'REAL':
      return 'hana.REAL'
    case 'DOUBLE':
      return 'Double';
    case 'CHAR':
    case 'NCHAR':
    case 'VARCHAR':
      return 'hana.VARCHAR'
    case 'SHORTTEXT':
      return 'String'
    case 'TEXT':
        return 'LargeString'
    case 'DATETIME':
      return 'DateTime';
    case 'TIMESTAMP':
    case 'LONGDATE':
    case 'SECONDDATE':
      return 'Timestamp';
    case 'NCLOB':
     return 'LargeString'
    case 'BLOB':
      return 'LargeBinary'
    case 'DATE':
      return 'Date'
    case 'SMALLDECIMAL':
      return 'hana.SMALLDECIMAL'
    case 'VARBINARY':
      return 'Binary'
    case 'ALPHANUM':
      return 'hana.ALPHANUM'
    case 'BINARY':
      return 'hana.BINARY'
    case 'TIME':
      return 'Time';
    case 'CLOB':
      return 'hana.CLOB'
    case 'ST_POINT':
      return 'hana.ST_POINT'
    case 'ST_GEOMETRY':
      return 'hana.ST_GEOMETRY'
    default:
      return types;
  }
}

const convertToHdbsynonym = (tableName) =>{
    return `"${tableName.toUpperCase().replace(/"/g, '').replace(/\./g, '_').replace(/::/g, '_')}" : {
      "target": {
        "object" : ${tableName}
      }
    }`
}

const splitLines = (data) =>{
  return data.split('\n').filter((line) => line.trim() !== '');
}

const formatTableStatement = (sqlStatement) => {
  let formatted = sqlStatement.replace(/\(/, '(\n');
  formatted = formatted.replace(/,\s(?!\w+\s*\[)/, ',\n  ');
  formatted = formatted.replace(/\)(?!\w+\s*\[)/, '\n)');
  return formatted;
}


const checkIfNumberAndBracket = (matches) =>{
  let matchesType = matches[1]
  const typeLengthBrackets = /\(\d+\)/g;
  const rightBracket = /\d+\)/;
  const leftBracket = /\(\d+/;
  if(matches[2] !== undefined){
    if(matches[2].match(typeLengthBrackets)) {
      return matchesType + matches[2]
    }else if(matches[2].match(rightBracket)){
      return matchesType + matches[2]
    }else if(matches[3] !== undefined && matches[2].match(leftBracket) && matches[3].match(rightBracket))
    return matchesType + matches[2] + matches[3]
  }
  return matchesType
}

const convertToCds = (data) =>{

  const sqlDataTypes = ['NVARCHAR','STRING','BOOLEAN','SHORTTEXT','REAL','ALPHANUM','DECIMAL','SMALLDECIMAL','DAYDATE','BINARY','VARBINARY','INTEGER','INT','TINYINT','SMALLINT','MEDIUMINT','BIGINT','NUMERIC','FLOAT','DOUBLE','NCHAR','CHAR','VARCHAR','TEXT','DATE','TIME','DATETIME','LONGDATE','TIMESTAMP','SECONDDATE','NCLOB','BLOB','ST_POINT','ST_GEOMETRY','CLOB'];
  let lines = splitLines(format(data, {language: 'postgresql'}))
  if(lines.length == 1){
    lines = splitLines(formatTableStatement(data))
  }
  let entityName = lines[0].replace(/column table /ig, '').trim().replace(' (', '')
  let tableName = entityName;
  entityName = entityName.replace(/"/g, '').replace(/\./g, '_').replace(/::/g, '_').toUpperCase();;

  let keyNamesArray = [];
  if (data.includes('PRIMARY KEY')) {
    let match = data.match(/PRIMARY KEY\s*\(\s*([^)]+?)\s*\)\s*\)/s);
    if (match && match[1]) {
      let keys = match[1].split(',');
      keyNamesArray = keys.map(key => key.trim().replace(/['"]/g, '').replace(/\./g, '_').toUpperCase());
    } 
  }

  const columns = [];
  for (let i = 1; i < lines.length ; i++) {
    const columnLine = lines[i].trim().replace(/COMMENT.*$/, '');
    if(columnLine !== ""){
      let matches = columnLine.split(" ").filter(Boolean);
      if(matches.length > 1 && sqlDataTypes.includes(dataTypesCleanUp(matches[1]).split('(')[0].replace(/['"]+/g, '').toUpperCase().trim())){
        let name = matches[0].replace(/"/g, '').replace(/\)+/, '').trim().replace(/\./g, '_').toUpperCase();
        let matchesType = checkIfNumberAndBracket(matches)
        if (name !== "COMMENT") {
            for(let j=0;j<keyNamesArray.length;j++){
              if (name === keyNamesArray[j]) {
                name = `key ${name}`;
                keyNamesArray.splice(j, 1);
                break
              }
            }
          const type = convertDbTypes(matchesType.toUpperCase());
          columns.push({name, type});
        }
      }
    }
  }

  let isEntityQuoted = tableName.includes('"')
  let planeColumnQuotedTable = isEntityQuoted ? convertToHdbsynonym(tableName) : undefined;

  let associationDetails = [];
  if(data.includes("ASSOCIATIONS") && data.includes("JOIN")){
    const splitdata = data.split("\n")
    splitdata.forEach((line)=>{
      let manipulatedData = convertSqlToAssociation(line)
      if(manipulatedData){
        associationDetails.push(manipulatedData)
      }
    })
  }
 
  const newFileContent = [
    `@cds.persistence.exists`,
    `Entity ${entityName} {`,
    ...columns.map(({ name, type }) => `  ${name}: ${type};`),
    ...associationDetails,
    '}',
  ].join('\n');

  return {
    newFileContent,
    planeColumnQuotedTable
  }
}

module.exports = {convertHdbtableToCds,convertDbTypes,reportHdbtableToCds,dataTypesCleanUp,convertToHdbsynonym,convertSqlToAssociation};
