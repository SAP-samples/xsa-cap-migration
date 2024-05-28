const fs1 = require("fs");
const shell = require("shelljs");


const convertHdbviewToCds = (directory, extension) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(extension));
    files.forEach(file => {
      let data = fs1.readFileSync(file, "utf8");
      let { newFileContent, entityName } = convertToCds(data);
      fs1.writeFileSync(`${entityName}.cds`, newFileContent);
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const getDefineView = (data) => {
  const lines = data.split('\n').filter((line) => line.trim() !== '');
  let entityName = lines[0].replace(/view /ig, '').trim().replace(' (', '').replace(/"/g, '').replace(/\./g, '_');

  let viewIndex = data.indexOf('VIEW');
  let viewNameStartIndex = data.indexOf('"', viewIndex) + 1;
  let viewNameEndIndex = data.indexOf('"', viewNameStartIndex);
  let viewName = data.substring(viewNameStartIndex, viewNameEndIndex);
  viewName = viewName.replace(/\./g, "_");

  let fromIndex = data.indexOf('FROM');
  let tableNameStartIndex = data.indexOf('"', fromIndex) + 1;
  let tableNameEndIndex = data.indexOf('"', tableNameStartIndex);
  let tableName = data.substring(tableNameStartIndex, tableNameEndIndex);

  let asIndex = data.indexOf('AS', fromIndex);
  let alias
  if (asIndex !== -1) {
    let aliasStartIndex = data.indexOf('"', asIndex) + 1;
    let aliasEndIndex = data.indexOf('"', aliasStartIndex);
    alias = data.substring(aliasStartIndex, aliasEndIndex);
    alias = alias.split("_")[0];
  }

  let whereIndex = data.indexOf('WHERE');
  let whereClause = "";
  if (whereIndex !== -1) {
    whereClause = data.substring(whereIndex + 'WHERE'.length).trim();
  }
  const defineOutput = `Entity ${viewName}`
  // const defineOutput = `Entity ${viewName} as select from ${tableName} ${alias ? "as " + alias : ""}`
  return { defineOutput, entityName, whereClause }
}

const getSelectFields = (data) => {
  let start = data.indexOf('AS SELECT') + 'AS SELECT'.length;
  let end = data.indexOf('FROM');
  let subString = data.substring(start, end).trim();
  let arrayOfSelectField = subString.split(',').map(line => line.trim());
  return { arrayOfSelectField };
}
const convertToCds = (data) => {
  let { defineOutput, entityName, whereClause } = getDefineView(data)
  let { arrayOfSelectField } = getSelectFields(data)
  let selectFieldFinalResult = arrayOfSelectField.map(field => {
    return field.replace(/_\$.*?\./g, '.').replace(/"/g, '').trim();
  });

  //FINAL DATA
  const newFileContent = [
    `@cds.persistence.exists`,
    `${defineOutput} {`,
    ...selectFieldFinalResult.map((name) => `  ${name} ;`),
    '}',
    whereClause ? `WHERE ${whereClause}` : ""
  ].join('\n');

  return { newFileContent, entityName }
}


module.exports = convertHdbviewToCds;