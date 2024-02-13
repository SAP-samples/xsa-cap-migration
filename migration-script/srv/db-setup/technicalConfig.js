const shell = require("shelljs");
const fs1 = require("fs");

const technicalConfig = (directory, option) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      if (
        /((?:\/\*.+\*\/\s)*Entity[\s\S]*?})\s+technical configuration\s+\{[\s\S]*?\}/.test(
          fileData
        )
      ) {
        fileData = fileData.replace(
          /((?:\/\*.+\*\/\s)*Entity[\s\S]*?})\s+technical configuration\s+\{([\s\S]*?)\}/g,
          (match, p1, p2) => {
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
              techConfigValue = techConfigValue.replace(/\;\s*$/, "");
              techConfigValue = techConfigValue.replace(/\s\s+/g, " ");
              if (techConfigValue === "") {
                return `\n${p1}`;
              } else {
                return `@sql.append: \`${techConfigValue}\`\n${p1}`;
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
