const fs1 = require("fs");
const path = require("path");
const shell = require("shelljs");


const moveAndIndexCds = (dir, newDir) => {
  try {
    if (!fs1.existsSync(newDir)) {
      fs1.mkdirSync(newDir);
    }
    const files = shell.find(dir).filter((file) => file.endsWith('.cds'));
    let indexContent = "";
    for (let file of files) {
        if (path.extname(file) === ".cds") {
          if(!file.includes('cds/')){
            let oldPath = path.join(dir, file);
            let newPath = path.join(newDir, file);
            fs1.renameSync(oldPath, newPath);
            let baseName = path.basename(file, ".cds");
            indexContent = indexContent.concat(`using from './cds/${baseName}';\n`);
          }else{
            indexContent = indexContent.concat(`using from './${file}';\n`);
          }
        }
    }
    fs1.writeFileSync("index.cds", indexContent, "utf8");
    console.log("All .cds files moved, and index.cds created.");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = moveAndIndexCds;
