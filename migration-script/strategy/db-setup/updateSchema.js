const fs1 = require("fs");
const path = require("path");

const updateSchema = (directoryPath) => {
  try {
    const files = fs1.readdirSync(directoryPath, { withFileTypes: true });
    for (let file of files) {
      const filePath = path.join(directoryPath, file.name);
      if (file.isDirectory()) {
        updateSchema(filePath);
      } else {
        if (
          path.extname(file.name) === ".hdbprocedure" ||
          path.extname(file.name) === ".hdbfunction"
        ) {
          let data = fs1.readFileSync(filePath, "utf8");
          let regex2 = /^(?!.*--)(.*DEFAULT SCHEMA \w+)( AS)?/gm;
          let newData = data.replace(
            regex2,
            function (fullMatch, match1, match2) {
              if (match2) {
                return "--" + match1.trim() + "\n" + match2.trim();
              } else {
                return "--" + match1.trim();
              }
            }
          );
          let regex3 = /(?:\b|\")([\w.]+)(?:\b|\")\.(\"[\w.]+::[\w.]+\")/g;
          newData = newData.replace(regex3, "$2");
          if (data !== newData) {
            fs1.writeFileSync(filePath, newData, "utf8");
            console.log("File has been updated:", filePath);
          }
        }
      }
    }
  } catch (err) {
    console.log("Error :", err);
  }
};

module.exports = updateSchema;
