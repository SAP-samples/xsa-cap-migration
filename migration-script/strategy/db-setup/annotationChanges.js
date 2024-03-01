const shell = require("shelljs");
const fs1 = require("fs");
const path = require("path");

const annotationUpdate = (directory) => {
  try {
    const files = fs1
      .readdirSync(directory)
      .filter((file) => file.endsWith(".cds"));
    let contextName = "";
    files.forEach((file) => {
      const fileData = fs1.readFileSync(path.join(directory, file), "utf8");
      let otherLines = [];
      let annotationContent = "";
      let annotationBlock = false;
      let currentAnnotation = "";
      let braceCounter = 0;
      const lines = fileData.split("\n");
      for (let line of lines) {
        if (line.trim().toLowerCase().startsWith("context")) {
          contextName = line.split(" ")[1];
          if (!annotationBlock) otherLines.push(line);
        } else if (line.trim().startsWith("annotation")) {
          braceCounter = 0;
          annotationBlock = true;
          line = line.replace("annotation ", `annotation ${contextName}.`);
          currentAnnotation = currentAnnotation + "\n" + line;
          braceCounter += (line.match(/{/g) || []).length;
          braceCounter -= (line.match(/}/g) || []).length;
        } else if (annotationBlock) {
          currentAnnotation = currentAnnotation + "\n" + line;
          braceCounter += (line.match(/{/g) || []).length;
          braceCounter -= (line.match(/}/g) || []).length;
          if (braceCounter === 0) {
            annotationContent += currentAnnotation + "\n\n";
            annotationBlock = false;
            currentAnnotation = "";
          }
        } else {
          otherLines.push(line);
        }
      }
      const newContent = otherLines.join("\n") + "\n\n" + annotationContent;
      fs1.writeFileSync(path.join(directory, file), newContent, "utf8");
    });
  } catch (err) {
    console.log("Error :", err);
  }
};

const commentAnnotation = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let updatedData = fileData.replace(
        /@Comment *: *["']([^"']*)["']/g,
        `/**\n * $1\n */`
      );
      fs1.writeFileSync(file, updatedData, "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const removeAnnotation = (directory) => {
  try {
    const files = shell
      .find(directory)
      .filter((file) => file.endsWith("annotations.cds"));
    files.forEach(function (file) {
      fs1.unlink(file, function (err) {
        if (err) throw err;
        console.log("annotations.cds was deleted");
      });
    });
    const cdsFiles = shell
      .find(directory)
      .filter((file) => file.endsWith(".cds"));
    cdsFiles.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let regex = /(?<=\n)[^\n]*from\s'\.\/annotations';[^\n]*(?=\n)/g;
      let updatedData = fileData.replace(regex, "");
      fs1.writeFileSync(file, updatedData, "utf8");
    });
    const indexCds = shell
      .find("../")
      .filter((file) => file.endsWith("index.cds"));
    indexCds.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let updatedData = fileData.replace(
        /using\sfrom\s'\.\/cds\/annotations';/g,
        ""
      );
      fs1.writeFileSync(file, updatedData, "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const modifyUIAnnotation = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let updatedData = fileData.replace(
        /(@UI\.)(\w)/g,
        function (_, uiMatch, annotation) {
          return uiMatch + annotation.toUpperCase();
        }
      );
      fs1.writeFileSync(file, updatedData, "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = {
  commentAnnotation,
  annotationUpdate,
  removeAnnotation,
  modifyUIAnnotation,
};
