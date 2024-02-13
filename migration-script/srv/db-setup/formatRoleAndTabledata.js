const shell = require("shelljs");
const fs1 = require("fs");
const path = require("path");

const formatRoleandTabledata = (directory, option) => {
  try {
    if (option == 1) {
      deleteFilesEmptyFolders(directory);
    }
    const files = shell
      .find(directory)
      .filter(
        (file) => file.endsWith(".hdbrole") || file.endsWith(".hdbgrants")
      );
    if (option == 2) {
      files.push(
        ...shell
          .find(directory)
          .filter((file) => file.endsWith(".hdbtabledata"))
      );
    }
    for (const file of files) {
      let data = fs1.readFileSync(file, "utf8");
      const jsonData = JSON.parse(data);
      let transformedData;
      if (file.endsWith("default_access_role.hdbrole")) {
        let name = jsonData.role && jsonData.role.name;
        transformedData = transform(jsonData);
        if (name) {
          transformedData.role.name = name;
        }
      } else if (file.endsWith(".hdbtabledata")) {
        const fileNames = jsonData.imports.map((importObj, index) => {
          let fileName = importObj.source_data.file_name;
          if (fileName.includes("::")) {
            fileName = fileName.split("::")[1];
          }
          return { index: index, fileName: fileName };
        });
        transformedData = transform(jsonData);
        fileNames.forEach((obj) => {
          transformedData.imports[obj.index].source_data.file_name =
            obj.fileName;
        });
      } else {
        transformedData = transform(jsonData);
      }
      let outputFileContent = JSON.stringify(transformedData, null, 4);
      fs1.writeFileSync(file, outputFileContent, "utf8");
    }
    console.log("The files are Successfully Transformed");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const deleteFilesEmptyFolders = (directory) => {
  try {
    const files = shell
      .find(directory)
      .filter(
        (file) => file.endsWith(".hdbtabledata") || file.endsWith(".csv")
      );
    for (const file of files) {
      if (shell.test("-f", file)) {
        shell.rm("-f", file);
      }
    }
    removeEmptyDirectories(directory);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const removeEmptyDirectories = (dir) => {
  try {
    const files = fs1.readdirSync(dir);
    for (const file of files) {
      let fullPath = path.join(dir, file);
      if (fs1.statSync(fullPath).isDirectory()) {
        removeEmptyDirectories(fullPath);
      }
    }
    const filesAfterCleanup = fs1.readdirSync(dir);
    if (
      (filesAfterCleanup.length === 0 ||
        (filesAfterCleanup.length === 1 &&
          filesAfterCleanup[0] === ".hdinamespace")) &&
      shell.test("-d", dir)
    ) {
      if (
        filesAfterCleanup[0] === ".hdinamespace" &&
        shell.test("-f", path.join(dir, ".hdinamespace"))
      ) {
        fs1.unlinkSync(path.join(dir, ".hdinamespace"));
      }
      fs1.rmdirSync(dir);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const transform = (node, is_key = true) => {
  try {
    let result = null;
    if (typeof node === "object") {
      result = Array.isArray(node) ? [] : {};
      for (let key in node) {
        result[transform(key)] = transform(node[key], false);
      }
    } else if (typeof node === "string") {
      if (!is_key) {
        result = node.replace(/\.|::|:/g, "_").toUpperCase();
      } else {
        result = node.toLowerCase();
      }
    } else {
      result = node;
    }
    return result;
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = formatRoleandTabledata;
