const fs1 = require("fs");
const path = require("path");

const convertHdbcdsToCds = (directory, oldExtension, newExtension) => {
  try {
    const files = fs1.readdirSync(directory, { withFileTypes: true });
    for (let file of files) {
      if (file.isDirectory()) {
        convertHdbcdsToCds(
          path.join(directory, file.name),
          oldExtension,
          newExtension
        );
      } else if (path.extname(file.name) === oldExtension) {
        const oldFileName = path.join(directory, file.name);
        const newFileName = path.join(
          directory,
          path.basename(file.name, oldExtension) + newExtension
        );
        fs1.renameSync(oldFileName, newFileName);
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = convertHdbcdsToCds;
