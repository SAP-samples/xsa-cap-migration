const shell = require("shelljs");
const fs1 = require("fs");
// const addDeployFormat = require("../addDeployFormat");

const technicalConfig = (directory, option) => {
  try {

    //converting to hdbtable-format
    // if(option == 3){
    //   var cap_db_dest = directory + "/db";
    //   process.chdir(cap_db_dest);
    //   const files = shell.find(".").filter((file) => file.endsWith(".cds"));
    //   files.forEach((file) => {
    //     let fileData = fs1.readFileSync(file, "utf8");
    //     let updatedFileData = fileData.replace(/@sql\.append:\s+`{3}\s*technical configuration \{\s*([\s\S]*?)\s*;\s*\}\s*`{3}/g,(match, p1) => {
    //     let techConfigValue = p1.trim();
    //     return `@sql.append: \`\`\`\n${techConfigValue}\n\`\`\``;
    //     });
    //   fs1.writeFileSync(file, updatedFileData, "utf8");
    //   });   
    //   process.chdir("../");
    //   addDeployFormat(option)
    // console.log("Condition met, exiting server");
    // process.exit(0)
    // }

    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      if (/((?:\/\*.+\*\/\s)*Entity[\s\S]*?})\s+technical configuration\s+\{[\s\S]*?\}/.test(fileData)) {
          fileData = fileData.replace(/((?:\/\*.+\*\/\s)*Entity[\s\S]*?})\s+technical configuration\s+\{([\s\S]*?)\}/g,(match, p1, p2) => {
            let techConfigValue;
            if (option == 1) {
              techConfigValue = p2
                .replace(/fulltext\s*index[\s\S]*?;/gi, "")
                .trim();
              techConfigValue = techConfigValue.replace(/\s\s+/g, " ");
              if (techConfigValue === "") {
                return `\n${p1}`;
              } else {
                return `\n@sql.append: \`\`\`\n  technical configuration {\n    ${techConfigValue}\n  }\n\`\`\`\n${p1}`;
              }
          } else {
              techConfigValue = p2
                .replace(/fulltext\s*index[\s\S]*?;/gi, "")
                .replace(/column\s*store[\s\S]*?;/gi, "")
                .replace(/row\s*store[\s\S]*?;/gi, "")
                .trim();
              const techConfigValueArray = techConfigValue.split(";");
              techConfigValue = techConfigValue.replace(/\;/g, "\n");
              if (techConfigValue === "") {
                return `\n${p1}`;
              } else {
                if (techConfigValueArray.length <= 1) {
                  return `@sql.append: \`${techConfigValue}\`\n${p1}`;
                } else {
                  return `@sql.append: \`\`\`\n ${techConfigValue}\n\`\`\`\n${p1}`;
                }
              }
            }
          }
        );
        fs1.writeFileSync(file, fileData, "utf8");
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = technicalConfig;
