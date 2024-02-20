const shell = require("shelljs");
const fs1 = require("fs");

const structuredPrivilege = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      if (
        /define view [\s\S]*? with structured privilege check;/.test(fileData)
      ) {
        fileData = fileData.replace(
          /(define view[\s\S]*?) with structured privilege check;/g,
          (match, p1) => {
            return `\n@sql.append: 'with structured privilege check'\n${p1};`;
          }
        );
        fs1.writeFileSync(file, fileData, "utf8");
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = structuredPrivilege;
