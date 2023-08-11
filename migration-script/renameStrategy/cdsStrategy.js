const cds = require('@sap/cds');
const fs = require('fs');

class CDS {
    configure(config){
    }
    process(fileContent){
        this._generateServiceStub(fileContent);
        return this._fixCDSContent(fileContent);
    }
    _generateServiceStub(fileContent){
        let model = cds.parse(fileContent);
        let entities = model["definitions"];
        let entitiyNames = Object.keys(entities);
        let modifiedContent = '';
        entitiyNames.forEach(entitiyName => {
            let entityContent = `entity <EntityName> as select from ${entitiyName.toUpperCase()} {\n`;
            let entity = entities[entitiyName];
            let columns = Object.keys(entity["elements"]);
            columns.forEach(column => {
                entityContent += `${column.toUpperCase()} as![${column}],\n`;
            });
            entityContent = entityContent.substring(0, entityContent.length-2);
            entityContent += '\n}\n';
            modifiedContent += entityContent + "\n";
        });
	    fs.writeFileSync('service.cds', modifiedContent);
    }
    _fixCDSContent(fileContent){
        let model = cds.parse(fileContent);
        let entities = model["definitions"];
        let entitiyNames = Object.keys(entities);
        let replacements = new Map();
        let columnNames = new Set();
        entitiyNames.forEach(entitiyName => {
            replacements.set(`![${entitiyName}]`, `![${entitiyName.toUpperCase()}]`)
            let entity = entities[entitiyName];
            let columns = Object.keys(entity["elements"]);
            columns.forEach(column => {
                columnNames.add(column);
                replacements.set(`![${column}]`, `![${column.toUpperCase()}]`)
            });
        });
        return fileContent.replace(/\!\[\w+\]/g, function(m) { // ![name]
            return replacements.get(m) || m;
        });
    }
}
module.exports = CDS;