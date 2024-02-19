const shell = require("shelljs");
const fs1 = require("fs");

const changeDataTypes = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      replaceInFile(file, "LocalDate", "Date");
      replaceInFile(file, "LocalTime", "Time");
      replaceInFile(file, "UTCDateTime", "DateTime");
      replaceInFile(file, "UTCTimestamp", "Timestamp");
      replaceInFile(file, "BinaryFloat", "Double");
    });
};

const replaceInFile = (filePath, searchValue, replaceValue) => {
  const fileContent = fs1.readFileSync(filePath, "utf8");
  const newContent = fileContent.replace(
    new RegExp(searchValue, "g"),
    replaceValue
  );
  fs1.writeFileSync(filePath, newContent);
};

module.exports = changeDataTypes;
