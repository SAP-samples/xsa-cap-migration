const shell = require("shelljs");
const fsExtra = require("fs-extra");
const os = require("os");
const fs1 = require("fs");
const path = require("path");

const setup_db = async (source, destination, option) => {
  try {
    console.log("Copying db artifacts to CAP project...");
    copyDbFiles(source, destination);
    console.log("Files copied!");
    console.log("Modify the .hdinamespace files");
    modifyHdiNamespace(destination);
    console.log("Convert hdbcds to cds");
    convertHdbcdsToCds();
    console.log("Using Calculation Views Modification");
    calViewModification();
    console.log("Modify the view notation");
    modifyViewNotation();
    console.log("Change Datatypes");
    changeDataTypes();
    console.log("Comment or remove the deprecated functionalities");
    removeDeprecated();
    console.log("Replace @OData.publish:true with @cds.autoexpose");
    replaceOdata();
    console.log("Move the cds files to db folder");
    moveToDB();
    console.log("Remove 'generated...;' and following in all lines");
    removeGenerated();
    console.log("Format hdbrole and hdbtabledata");
    formatRoleandTabledata(".", option);
    console.log("Format hdbsynonymconfig");
    formatSynonymConfig(".");
    console.log("Create hdbtabletype files");
    processFolder(".");
    console.log("Modify the Simple using statements");
    replaceSimpleUsingInFiles(".");
    console.log("Modify using notation for statements with ::");
    replaceUsingInFiles(".");
    console.log("Move the cds files to a cds folder and create an index.cds");
    moveAndIndexCds(".", "./cds");
    console.log("Modify the technical configurations");
    technicalConfig(".", option);
    console.log("Update the Structure privilege check");
    structuredPrivilege(".");
    console.log("Remove Series Entity");
    removeSeriesFunction(".");
    console.log("Replace @Comment with /* */");
    commentAnnotation(".");
    console.log("Modify the annotation syntax");
    annotationUpdate("./cds");
    console.log("Remove Schema");
    updateSchema(".");
    console.log("Compile the cds files and create a log file");
    findFiles(".");
    process.chdir("../");
  } catch (e) {
    console.error(`Failed with error ${e}`);
  }
};

const copyDbFiles = (source, destination) => {
  fsExtra.copySync(source, destination);
};

const modifyHdiNamespace = (destination) => {
  process.chdir(destination);
  try {
    shell
      .find(".")
      .filter((file) => path.basename(file) === ".hdinamespace")
      .forEach((file) => {
        let fileContent = fs1.readFileSync(file, "utf8");
        let contentJSON = JSON.parse(fileContent);
        if (Array.isArray(contentJSON)) {
          for (let element of contentJSON) {
            element["name"] = "";
            element["subfolder"] = "ignore";
          }
        } else if (typeof contentJSON === "object" && contentJSON !== null) {
          contentJSON["name"] = "";
          contentJSON["subfolder"] = "ignore";
        }
        fs1.writeFileSync(file, JSON.stringify(contentJSON, null, 2));
      });
    console.log(".hdinamespace has been updated.");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const convertHdbcdsToCds = () => {
  renameFiles(".", ".hdbcds", ".cds");
};

const calViewModification = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      const fileContent = fs1.readFileSync(file, "utf8");
      const regex1 =
        /(using)\s+([\"']*)([\w\.]*::[\w\.]*)([\"']*)\s*(as)\s*([^\s;]*);/gi;
      let newContent = fileContent;
      const replacer1 = function (
        _,
        keyword1,
        quote1,
        namespace,
        quote2,
        asKeyword,
        alias = ""
      ) {
        const newNamespace = namespace
          .replace(/\s/g, "")
          .replace(/\.|\:\:/g, "_")
          .toUpperCase();
        const newFileContent = `@cds.persistence.exists\n@cds.persistence.calcview\nEntity ${newNamespace}\n{\n};`;
        fs1.writeFileSync(`${newNamespace}.cds`, newFileContent);
        return `${keyword1} ${newNamespace} ${asKeyword} ${alias} from './${newNamespace}';`;
      };
      newContent = newContent.replace(regex1, replacer1);
      fs1.writeFileSync(file, newContent);
    });
};

const modifyViewNotation = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      shell.exec(
        `sh -c "cat ${file} | sed -e 's/\\"/\\![/; s/\\"/]/' > ${file}.cases; mv ${file}.cases ${file};"`
      );
      shell.exec(
        `sh -c "cat ${file} | sed -e 's/\\"/\\![/; s/\\"/]/' > ${file}.cases; mv ${file}.cases ${file};"`
      );
    });
};

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

const removeDeprecated = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      shell.exec(
        `sh -c "cat ${file} | sed -e 's@temporary Entity@\\/\\* temporary \\*\\/ Entity@g' > ${file}.cases; mv ${file}.cases ${file};"`
      );
    });
};

const replaceOdata = () => {
  shell
    .find(".")
    .filter(function (file) {
      return file.endsWith(".cds");
    })
    .forEach(function (file) {
      shell.sed("-i", /@OData\.publish\s*:*\s*true/g, "@cds.autoexpose", file);
    });
};

const moveToDB = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      shell.mv(file, ".");
    });
};

const removeGenerated = () => {
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      shell.exec(
        `sh -c "cat ${file} | sed -e 's/generated always.*;/;/g' > ${file}.cases; mv ${file}.cases ${file};"`
      );
    });
};

const renameFiles = (directory, oldExtension, newExtension) => {
  try {
    const files = fs1.readdirSync(directory, { withFileTypes: true });
    for (let file of files) {
      if (file.isDirectory()) {
        renameFiles(
          path.join(directory, file.name),
          oldExtension,
          newExtension
        );
      } else if (path.extname(file.name) === oldExtension) {
        const oldFileName = path.join(directory, file.name);
        const newFileName = path.join(
          directory,
          path.basename(file.name, oldExtension) + newExtension
        );
        fs1.renameSync(oldFileName, newFileName);
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const replaceInFile = (filePath, searchValue, replaceValue) => {
  const fileContent = fs1.readFileSync(filePath, "utf8");
  const newContent = fileContent.replace(
    new RegExp(searchValue, "g"),
    replaceValue
  );
  fs1.writeFileSync(filePath, newContent);
};

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
    let regexTableType = /table\s+(type|Type)\s+(\w+)\s*{/i;
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

const replaceSimpleUsingInFiles = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      try {
        const data = fs1.readFileSync(file, "utf8");
        if (data.includes("::")) return;
        let regex = /(using\s+)([^\s;]+)(?:\s+as\s+([^\s.;]+))?;/g;
        let result = data.replace(regex, function (_, p1, p2, p3) {
          let pack = p2;
          let alias = p3 || p2.split(".").pop();
          return `${p1}${pack} as ${alias} from './${p2.split(".")[0]}';`;
        });
        fs1.writeFileSync(file, result, "utf8");
      } catch (err) {
        console.error("Unable to read or write file: " + err);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const replaceUsingInFiles = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      try {
        const data = fs1.readFileSync(file, "utf8");
        let regex = /(using\s+)([^:]+)::([^.\n]+)(\.([^;\n]+))?;/g;
        let result = data.replace(regex, function (_, p1, p2, p3, p4, p5) {
          if (p5) {
            return `${p1}${p2}.${p3}${p4} as ${p5} from './${p3}';`;
          } else {
            return `${p1}${p2}.${p3} as ${p3} from './${p3}';`;
          }
        });
        fs1.writeFileSync(file, result, "utf8");
      } catch (err) {
        console.error("Unable to read or write file: " + err);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const moveAndIndexCds = (dir, newDir) => {
  try {
    if (!fs1.existsSync(newDir)) {
      fs1.mkdirSync(newDir);
    }
    let files = fs1.readdirSync(dir);
    let indexContent = "";
    for (let file of files) {
      let oldPath = path.join(dir, file);
      let newPath = path.join(newDir, file);
      if (path.extname(file) === ".cds") {
        fs1.renameSync(oldPath, newPath);
        let baseName = path.basename(file, ".cds");
        indexContent = indexContent.concat(`using from './cds/${baseName}';\n`);
      }
    }
    fs1.writeFileSync("index.cds", indexContent, "utf8");
    console.log("All .cds files moved, and index.cds created.");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

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

const structuredPrivilege = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      if (
        /define view [\s\S]*? with structured privilege check;/.test(fileData)
      ) {
        fileData = fileData.replace(
          /(define view[\s\S]*?) with structured privilege check;/g,
          (match, p1) => {
            return `\n@sql.append: 'with structured privilege check'\n${p1};`;
          }
        );
        fs1.writeFileSync(file, fileData, "utf8");
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const removeSeriesFunction = (directory) => {
  try {
    const files = shell.find(directory).filter((file) => file.endsWith(".cds"));
    files.forEach(function (file) {
      let fileData = fs1.readFileSync(file, "utf8");
      let regexSeries = /(series\s*\(([^()]*|\([^()]*\))*\))/gm;
      while (regexSeries.test(fileData)) {
        fileData = fileData.replace(regexSeries, "");
        regexSeries.lastIndex = 0;
      }
      fs1.writeFileSync(file, fileData.trim(), "utf8");
    });
  } catch (error) {
    console.error(`Error: ${error}`);
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

const findFiles = (dir) => {
  try {
    const outDir = path.resolve(dir, "../logs");
    if (!fs1.existsSync(outDir)) {
      fs1.mkdirSync(outDir);
    }
    let files = shell.ls("-Rl", `${dir}/*.cds`);
    for (const file of files) {
      let tmp = path.join(
        os.tmpdir(),
        "shelljs_" + Math.random().toString().slice(2)
      );
      shell.exec(`cds compile ${file.name} 2> ${tmp}`, { silent: true });
      if (fs1.statSync(tmp).size !== 0) {
        let currentTimestamp = new Date().getTime();
        let errorLogFilename = `${path.basename(
          file.name
        )}_${currentTimestamp}.errors.log`;
        shell.mv(tmp, path.join(outDir, errorLogFilename));
      } else {
        shell.rm(tmp);
      }
    }
  } catch (e) {
    console.error(`Failed to copy with error ${e}`);
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

module.exports = setup_db;
