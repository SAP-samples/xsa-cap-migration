const fs1 = require("fs");
const path = require("path");

const moveAndIndexCds = (dir, newDir) => {
  try {
    if (!fs1.existsSync(newDir)) {
      fs1.mkdirSync(newDir);
    }
    let files = fs1.readdirSync(dir);
    let indexContent = "";
    for (let file of files) {
      let oldPath = path.join(dir, file);
      let newPath = path.join(newDir, file);
      if (path.extname(file) === ".cds") {
        fs1.renameSync(oldPath, newPath);
        let baseName = path.basename(file, ".cds");
        indexContent = indexContent.concat(`using from './cds/${baseName}';\n`);
      }
    }
    fs1.writeFileSync("index.cds", indexContent, "utf8");
    console.log("All .cds files moved, and index.cds created.");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = moveAndIndexCds;
