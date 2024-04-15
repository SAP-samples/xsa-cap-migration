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
    //remove annotations that are of the format `annotation MyAnnotation1: String(40);`
    const cdsFiles = shell
      .find(directory)
      .filter((file) => file.endsWith(".cds"));
    cdsFiles.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let regex = /annotation\b\s\w+\s*:\s*\w+\(\d+\)\s*;?/g
      let updatedData = fileData.replace(regex, "");
      fs1.writeFileSync(file, updatedData, "utf8");
    });

    //getting the names of all annotations
    const getWords = shell
      .find(directory)
      .filter((file) => file.endsWith(".cds"));
    let wordsArray = [];
    getWords.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let matches = fileData.match(/annotation\s+(.*?)\s*\{/g);

      if (matches) {
        matches.forEach((match) => {
          let words = match
            .replace(/annotation\s+|\s*\{/g, "")
            .trim()
            .split(/\s+/);
          wordsArray.push(...words);
        });
      }
    });

    //removing usages of the previously fetched annotations
    const cdsFileUsing = shell.find("../").filter((file) => file.endsWith(".cds"));
    cdsFileUsing.forEach(function (file) {
      let fileData2 = fs1.readFileSync(file, "utf8");

      wordsArray.forEach((word) => {
        let regex = new RegExp(
          `using .*?${word}.*? as \\w+ from './.*?';`,
          "g"
        );
        fileData2 = fileData2.replace(regex, "");
      });

      fs1.writeFileSync(file, fileData2, "utf8");
    });

    //removing annotation block (annotations with nested braces)
    function removeAnnotationBlocks(text, wordsArray) {
      for (let word of wordsArray) {
        //regex pattern to match all the nested blocks
        const pattern = new RegExp(
          `annotation\\s+${word}\\s*\\{(?:[^{}]*|\\{(?:[^{}]*|\\{(?:[^{}]*|\\{[^{}]*\\})*\\})*\\})*\\};?`,
          "gs"
        );
        text = text.replace(pattern, "");
      }
      return text;
    }
    const annotationFiles = shell.find("../").filter((file) => file.endsWith(".cds"));
    annotationFiles.forEach(function (file) {
      let fileData2 = fs1.readFileSync(file, "utf8");
      let cleanedText = removeAnnotationBlocks(fileData2, wordsArray);
      fs1.writeFileSync(file, cleanedText, "utf8");
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
