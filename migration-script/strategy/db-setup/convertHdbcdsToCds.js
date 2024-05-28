const fs1 = require("fs");
const path = require("path");
const {ensureDirSync,moveSync} = require('fs-extra')

let reportHdbcdsFiles = []
let reportHdbcdsToCdsFiles = []
const reportHdbcdsToCds = () =>{
  return {reportHdbcdsFiles,reportHdbcdsToCdsFiles}
}

const convertHdbcdsToCds = (directory, oldExtension, newExtension) => {
  try {
    const files = fs1.readdirSync(directory, { withFileTypes: true });
    let cdsDirectoryPath = path.join(process.cwd(), 'cds');
    ensureDirSync(cdsDirectoryPath);
    for (let file of files) {
      if (file.isDirectory()) {
        convertHdbcdsToCds(
          path.join(directory, file.name),
          oldExtension,
          newExtension
        );
      } else if (path.extname(file.name) === oldExtension) {
        reportHdbcdsFiles.push(file.name)
        const oldFileName = path.join(directory, file.name);
        const newFileName = path.join(
          directory,
          path.basename(file.name, oldExtension) + newExtension
        );
        reportHdbcdsToCdsFiles.push(path.basename(newFileName))
        fs1.renameSync(oldFileName, newFileName);
        let relativePath;
        let opsys = process.platform;
        if (opsys == "win32" || opsys == "win64") {
          relativePath = path.relative(newFileName.split('\\')[0], newFileName);
        }
        else{
          relativePath = path.relative(newFileName.split('/')[0], newFileName);
        }
        let newDestinationPath = path.join(cdsDirectoryPath,path.dirname(relativePath));
        ensureDirSync(newDestinationPath);
        if (fs1.existsSync(newDestinationPath)) {
          moveSync(newFileName, path.join(newDestinationPath, path.basename(newFileName)));
        } else {
          console.error("Destination folder doesn't exist");
        }
      }
    }
  } catch (error) {
    console.error(`convert HDBcds to CDS Error: ${error}`);
  }
};

module.exports = {convertHdbcdsToCds,reportHdbcdsToCds};
