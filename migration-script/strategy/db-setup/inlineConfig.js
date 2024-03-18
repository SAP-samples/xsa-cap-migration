const shell = require("shelljs");
const fs1 = require("fs");
const dataTypes = [
  "Integer",
  "String",
  "Boolean",
  "Decimal",
  "LocalDate",
  "VARCHAR",
  "TINYINT",
];

const inlineConfig = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      const lines = fileData.split("\n");
      for (let i = 0; i < lines.length; i++) {
        dataTypes.forEach((type) => {
          let regex = new RegExp(
            ":\\s*" + type + "\\s*(\\(.+?\\))?" + "\\s*([^;]*);",
            "gi"
          );
          lines[i] = lines[i].replace(regex, function (match, p1, p2) {
            if (
              p2 !== "" &&
              !p2.includes("default") &&
              !p2.includes("null") &&
              !/^=/.test(p2.trim()) &&
              !/^\d/.test(p2.trim())
            ) {
              return `: ${type}${
                p1 ? " " + p1 : ""
              } @sql.append: \`${p2.trim()}\`;`;
            }
            return match;
          });
        });
      }
      fileData = lines.join("\n");
      fs1.writeFileSync(file, fileData, "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = inlineConfig;
