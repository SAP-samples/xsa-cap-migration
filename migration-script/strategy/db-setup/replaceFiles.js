const shell = require("shelljs");
const fs1 = require("fs");
const {groupContextEntity,getRelativePath} = require("./groupContextEntity");
const path = require('path')

const replaceSimpleUsingInFiles = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    const modifiedData = groupContextEntity(".",".cds");
    files.forEach(function (file) {
      try {
        const data = fs1.readFileSync(file, "utf8");
        if (data.includes("::") || data.includes(": :")) return;
        let regex = /(using\s+)([^\s;]+)(?:\s+as\s+([^\s.;]+))?;/g;
        let result = data.replace(regex, function (_, p1, p2, p3) {
          let pack = p2;
          let alias = p3 || p2.split(".").pop();
          for (const item of modifiedData.extractingData) {
            if (item.context === p2.split(".")[0].toUpperCase()) {
                const result = getRelativePath(item.file, file);
                return `${p1}${pack} as ${alias} from '${result}';`;
            }
          }
          return `${p1}${pack} as ${alias} from './${p2.split(".")[0]}';`;
        });
        fs1.writeFileSync(file, result, "utf8");
      } catch (err) {
        console.error("Unable to read or write file: " + err);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const replaceUsingInFiles = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      try {
        const data = fs1.readFileSync(file, "utf8");
        let regex = /(using\s+)([^:]+)(?::\s*:\s*)([^.\n]+)(\.([^;\n]+))?;/g;
        let result = data.replace(regex, function (_, p1, p2, p3, p4, p5) {
          p2 = p2.trim();
          p3 = p3.replace(":", "").trim();
          if (p5) {
            return `${p1}${p2}.${p3}${p4} as ${p5} from './${p3}';`;
          } else {
            return `${p1}${p2}.${p3} as ${p3} from './${p3}';`;
          }
        });
        fs1.writeFileSync(file, result, "utf8");
      } catch (err) {
        console.error("Unable to read or write file: " + err);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const replacePatternsInFiles = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    const modifiedData = groupContextEntity(".",".cds");
    files.forEach(function (file) {
      try {
        const data = fs1.readFileSync(file, "utf8");
        let regex = /"([\w.]*::(\w+(\.\w+)*))"/g;
        let seenStatements = new Set();
        let usingStatements = [];
        const tempValue = []
        let duplicateObject = {}
        let result = data.replace(regex, function (match, p1, p2) {
          let splitEntity =  p2.split(".")
          let nameSpace = p1.replace(/::/g, '.').replace(`.${splitEntity[1]}`,'').trim()
          let aliasSPlit = splitEntity[0]
          for (const item of modifiedData.extractingData) {
              if (item.file !== file && item.context === splitEntity[0].toUpperCase()) {
                  for(const entity of item.entities){
                      if(entity ==  splitEntity[1].toUpperCase()){
                          const resultSplit = getRelativePath(item.file, file);
                          let extendedName = path.dirname(item.file).split('/')
                          let fileNameWithoutExt;
                          if(extendedName.length > 3){
                            fileNameWithoutExt = `${extendedName[1]}_${extendedName[2]}`
                          }else if(extendedName.length > 1){
                            fileNameWithoutExt = extendedName[1];
                          }
                          if(!tempValue.includes(p2) && !seenStatements.has(`'${resultSplit}';`)){
                              tempValue.push(p2)
                          }
                          if(fileNameWithoutExt){
                            aliasSPlit = `${fileNameWithoutExt}_${splitEntity[0]}`
                            p2 = `${fileNameWithoutExt}_${splitEntity[0]}.${splitEntity[1]}`
                          }else{
                            aliasSPlit = `${splitEntity[0]}`
                            p2 = `${splitEntity[0]}.${splitEntity[1]}`
                          }
                          if(duplicateObject.hasOwnProperty(p2)){
                            aliasSPlit = duplicateObject[p2]
                          }else{
                              duplicateObject[p2] = aliasSPlit;
                          }
                          if (!seenStatements.has(`'${resultSplit}';`)) {
                            usingStatements.push(`using ${nameSpace} as ${aliasSPlit} from '${resultSplit}';`);
                            seenStatements.add(`'${resultSplit}';`);
                          }
                          return p2
                      }
                  }
              }
          }
          return p2;
      });
        let lowerCaseResult = result.toLowerCase();
        let insertIndex = lowerCaseResult.indexOf('namespace') !== -1 ? lowerCaseResult.indexOf('namespace') : lowerCaseResult.indexOf('context');
        if (insertIndex !== -1) {
            result = result.slice(0, insertIndex) + usingStatements.join('\n') + "\n\n" + result.slice(insertIndex);
        }
        fs1.writeFileSync(file, result, "utf8");        
      } catch (err) {
        console.error("Unable to read or write the file: " + err);
      }
    });
  } catch (error) {
    console.error("Unable to read or write the file: " + err);
  }
};

module.exports = { replaceSimpleUsingInFiles, replaceUsingInFiles,replacePatternsInFiles };
