const shell = require("shelljs");
const fs1 = require("fs");

const formatSynonymConfig = (directory) => {
  try {
    const files = shell
      .find(directory)
      .filter(
        (file) =>
          file.endsWith(".hdbsynonymconfig") ||
          file.endsWith(".hdbsynonym") ||
          file.endsWith(".hdbroleconfig")
      );
    for (const file of files) {
      let data = fs1.readFileSync(file, "utf8");
      const jsonData = JSON.parse(data);
      const transformedData = transformSynonym(jsonData);
      let outputFileContent = JSON.stringify(transformedData, null, 4);
      fs1.writeFileSync(file, outputFileContent, "utf8");
    }
    console.log("The files are Successfully Transformed");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const transformSynonym = (node, parentKey = "") => {
  try {
    let result = null;
    if (typeof node === "object" && !Array.isArray(node)) {
      result = {};
      for (let key in node) {
        const newKey =
          parentKey === "" ? key.replace(/\.|::|:/g, "_").toUpperCase() : key;
        result[newKey] = transformSynonym(node[key], key);
      }
    } else if (typeof node === "string" && parentKey === "object") {
      result = node.replace(/\./g, "_").replace(/::/g, "_").toUpperCase();
    } else {
      result = node;
    }
    return result;
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = formatSynonymConfig;
