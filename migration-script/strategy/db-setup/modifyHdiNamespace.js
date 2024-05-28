const shell = require("shelljs");
const fs1 = require("fs");
const path = require("path");

let reportHdiNamespaceFiles = []
const reportHdiNamespaceModify =()=>{
  return reportHdiNamespaceFiles
}

const modifyHdiNamespace = (destination) => {
  process.chdir(destination);
  try {
    shell
      .find(".")
      .filter((file) => path.basename(file) === ".hdinamespace")
      .forEach((file) => {
        reportHdiNamespaceFiles.push(file)
        let fileContent = fs1.readFileSync(file, "utf8");
        let contentJSON = JSON.parse(fileContent);
        if (Array.isArray(contentJSON)) {
          for (let element of contentJSON) {
            element["name"] = "";
            element["subfolder"] = "ignore";
          }
        } else if (typeof contentJSON === "object" && contentJSON !== null) {
          contentJSON["name"] = "";
          contentJSON["subfolder"] = "ignore";
        }
        fs1.writeFileSync(file, JSON.stringify(contentJSON, null, 2));
      });
    console.log(".hdinamespace has been updated.");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = {modifyHdiNamespace,reportHdiNamespaceModify};
