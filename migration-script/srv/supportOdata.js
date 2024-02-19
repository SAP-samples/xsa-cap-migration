const fs1 = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const odataV2Support = async (directory) => {
  try {
    console.log("Add Odata V2 Support");
    let absDirectory = path.resolve(directory);
    execSync("npm add @cap-js-community/odata-v2-adapter", {
      stdio: "inherit",
      cwd: absDirectory,
    });
    execSync("npm add @sap/cds-lsp", { stdio: "inherit", cwd: absDirectory });
    const data = fs1.readFileSync("package.json", "utf8");
    const packageJson = JSON.parse(data);
    if (!packageJson.cds) {
      packageJson.cds = {};
    }
    packageJson.cds.cov2ap = {
      plugin: true,
      path: "v2",
    };
    packageJson.cds.cdsc = {
      docs: true,
    };
    packageJson.cds.hana = {
      comments: true,
    };
    fs1.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log("Successfully Added Odata V2 Support");
    execSync("npm install @sap/cds-dk", {
      stdio: "inherit",
      cwd: absDirectory,
    });
    execSync("npm install @sap/cds-lsp", {
      stdio: "inherit",
      cwd: absDirectory,
    });
    console.log("Successfully installed cds node modules");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = odataV2Support;
