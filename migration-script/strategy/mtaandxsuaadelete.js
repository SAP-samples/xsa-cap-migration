const fs1 = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const mtaandxsuaa = async (directory) => {
  try {
    let absDirectory = path.resolve(directory);
    execSync("cds add xsuaa", { stdio: "inherit", cwd: absDirectory });
    console.log("Successfully added xsuaa");
    execSync("cds add mta", { stdio: "inherit", cwd: absDirectory });
    console.log("Successfully added mta");
    if (!fs1.existsSync("node_modules")) {
      let absDirectory1 = path.resolve(directory);
      console.log("node_modules directory does not exist, installing...");
      execSync("npm install", { stdio: "inherit", cwd: absDirectory });
      execSync("npm i @sap/cds-lsp",{ stdio: "inherit", cwd: absDirectory })
      console.log("Successfully installed node packages");
    } else {
      console.log("node_modules directory exists.");
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = mtaandxsuaa;
