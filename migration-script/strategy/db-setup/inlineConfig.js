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
      dataTypes.forEach((type) => {
        const regex = new RegExp(
          ":\\s*" + type + "\\s*(\\(.+?\\))?" + "\\s*([^;]*);",
          "gi"
        );

        fileData = fileData.replace(
          regex,
          (match, captureGroup1, captureGroup2) => {
            if (
              !captureGroup2.includes("default") &&
              !captureGroup2.includes(")") &&
              !captureGroup2.includes(",") &&
              !captureGroup2.includes("enum") &&
              captureGroup2 !== "" &&
              !captureGroup2.includes("select") &&
              !captureGroup2.includes("null") &&
              !/^=/.test(captureGroup2.trim()) &&
              !/^\d/.test(captureGroup2.trim())
            ) {
              if (captureGroup1 !== undefined) {
                return `: ${type}${captureGroup1} @sql.append:\`${captureGroup2}\`;`;
              } else {
                return `: ${type} @sql.append:\`${captureGroup2}\`;`;
              }
            } else {
              return match;
            }
          }
        );
      });
      fs1.writeFileSync(file, fileData, "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = inlineConfig;
