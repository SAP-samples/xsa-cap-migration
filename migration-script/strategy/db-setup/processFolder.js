const fs1 = require("fs");
const path = require("path");

const processFolder = (directory) => {
  try {
    const files = fs1.readdirSync(directory);
    for (file of files) {
      if (path.extname(file) === ".cds") {
        createhdbtabletype(path.join(directory, file));
        checkAndDeleteFile(path.join(directory, file));
      }
    }
  } catch (err) {
    console.error(`Error: ${err}`);
  }
};

const createhdbtabletype = (file) => {
  try {
    let data = fs1.readFileSync(file, "utf8");
    let lines = data.trim().split("\n");
    let regexContext = /context\s(\w+)\s\{/i;
    let regexTableType = /table\s+(type|Type)\s+(\w+)\s*/i;
    let regexBraceStart = /^\s*\{\s*$/i;
    let regexEntityTable = /Entity\s+(\w+)\s*{/i;
    let regexBraceEnd = /};\s*$/i;
    let contexts = [];
    let tableName = "";
    let args = [];
    let tableTypeLines = [];
    let inTableTypeContext = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let contextMatch = regexContext.exec(line);
      if (contextMatch) {
        contexts.push(contextMatch[1]);
        continue;
      }
      let tableTypeMatch = regexTableType.exec(line);
      if (tableTypeMatch) {
        inTableTypeContext = true;
        tableName = tableTypeMatch[2];
        if (regexBraceStart.test(lines[i + 1])) {
          lines[i + 1] = lines[i + 1].replace("{", "");
        }
        tableTypeLines.push(i);
        continue;
      }
      let entityTableMatch = regexEntityTable.exec(line);
      if (entityTableMatch) {
        inTableTypeContext = false;
      }
      if (inTableTypeContext) {
        if (regexBraceEnd.test(line)) {
          processTableType(contexts, tableName, args);
          args = [];
          tableName = "";
          tableTypeLines.push(i);
          inTableTypeContext = false;
        } else {
          let [colName, colType] = line.trim().split(/\s*:\s*/);
          if (colName && colType) {
            args.push(
              `"${colName}" ${colType
                .replace("String", "NVARCHAR")
                .replace(/;/g, "")}`
            );
            tableTypeLines.push(i);
          }
        }
      }
    }
    lines = lines.filter((_, index) => !tableTypeLines.includes(index));
    fs1.writeFileSync(file, lines.join("\n"), "utf8");

    if (tableName.length > 0 && args.length > 0) {
      processTableType(contexts, tableName, args);
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const checkAndDeleteFile = (file) => {
  try {
    const data = fs1.readFileSync(file, "utf8");
    const isEmpty = data.trim() === "";
    if (isEmpty) {
      fs1.unlinkSync(file);
      console.log(`Deleted file: ${file}`);
      return;
    }
    if (!data.includes("context")) {
      return;
    }
    const blocks = data.match(/context\s+\w+\s*{[^}]*}/gi) || [];
    const nonEmptyBlocks = blocks.filter(
      (block) => !/context\s+\w+\s*{\s*\n*\t*}/gi.test(block)
    );
    if (nonEmptyBlocks.length === 0) {
      fs1.unlinkSync(file);
      console.log(`Deleted file: ${file}`);
      return;
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const processTableType = (contexts, tableName, args) => {
  try {
    let dir = path.join(".", "src", "types");
    if (!fs1.existsSync(dir)) {
      fs1.mkdirSync(dir, { recursive: true });
    }
    let prefix =
      contexts.length > 0
        ? contexts[contexts.length - 1].toUpperCase() + "_"
        : "";
    let newTypeName = `"${prefix}${tableName.toUpperCase()}"`;
    let newContent = `TYPE ${newTypeName} AS TABLE (\n\t${args.join(
      ",\n\t"
    )}\n);`;
    let newFile = path.join(
      dir,
      `${prefix}${tableName.toUpperCase()}.hdbtabletype`
    );
    fs1.writeFileSync(newFile, newContent, "utf8");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = processFolder;
