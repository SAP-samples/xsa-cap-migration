const { readFileSync } = require("fs-extra");
const {find} = require("shelljs");
const path = require('path');
const groupContextEntity = (directory,extension) =>{
    try {
        const files = find(directory).filter((file) => file.endsWith(extension));
        const extractingData = files.map(file => { 
            let data = readFileSync(file, "utf8");
            let lines = data.toUpperCase().split('\n');
            let contextLine = lines.find(line => line.includes('CONTEXT'));
            let context = contextLine? contextLine.split(' ')[1] : "";
            let entitiesLines = lines.filter(line => line.includes('ENTITY'));
            let entities = entitiesLines?.map(line => line.split('ENTITY')[1].replace(/(\w+)\{/g, "$1").trim().split(' ')[0]);
            let annotationLines = lines.filter(line => line.includes('ANNOTATIONS'));
            let annotation = annotationLines?.map(line => line.split('ANNOTATIONS')[1].trim().split(' ')[0]);
            if(context) {
                return { file, context, entities ,annotation};
            }
        }).filter(item => item)
        return {extractingData};
    } catch (error) {
        console.log('Error while grouping',error)
    }
}

const getRelativePath = (filePath1, filePath2) =>{
    const dir1 = path.dirname(filePath1);
    const dir2 = path.dirname(filePath2);

    let relativePath = path.relative(dir2, dir1);
    const filename = path.basename(filePath1);
    if(relativePath === '') {
        return './' + filename;
    }
    
    if(!relativePath.startsWith('..')) {
        relativePath = './' + relativePath;
    }
  
    return `${relativePath.replace(/\\/g, "/")}/${filename}`;
}

module.exports = {groupContextEntity,getRelativePath}