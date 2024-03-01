const shell = require("shelljs");
const fs1 = require("fs");

const removeSeriesFunction = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let regexSeries = /(series\s*\(([^()]*|\([^()]*\))*\))/gm;
      while (regexSeries.test(fileData)) {
        fileData = fileData.replace(regexSeries, "");
        regexSeries.lastIndex = 0;
      }
      fs1.writeFileSync(file, fileData.trim(), "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = removeSeriesFunction;
