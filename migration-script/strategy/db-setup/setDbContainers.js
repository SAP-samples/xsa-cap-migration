const setup_db = require("./setupDB");
const glob = require("glob");
const fs1 = require("fs");
const { execSync } = require("child_process");
const path = require("path");

 const setup_db_containers = (
  CAP_DIR,
  XSA_DIR,
  CONTAINER_NUM,
  paramArray,
  option
) => {
  try {
    if (CONTAINER_NUM == 1) {
      var haas_db_src = XSA_DIR + "/" + paramArray[0];
      var cap_db_dest = CAP_DIR + "/db";
      setup_db(haas_db_src, cap_db_dest, option);
    } else if (CONTAINER_NUM > 1) {
      createFolderAndCopy(CAP_DIR, XSA_DIR, CONTAINER_NUM, paramArray, option);
    }
    // console.log("Exposing Tables and views");
    // createOdata(CAP_DIR);
    execSync("cds add hana", { stdio: "inherit" });
    console.log("Successfully added hana");
    createDefaultsFolderAndFiles();
    console.log("defaults folder and files created successfully");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const createDefaultsFolderAndFiles = () => {
  try {
    const dirPath = path.join(process.cwd(), "db/src/defaults");
    if (!fs1.existsSync(dirPath)) {
      fs1.mkdirSync(dirPath, { recursive: true });
    }
    const hdinamespacePath = path.join(dirPath, ".hdinamespace");
    if (!fs1.existsSync(hdinamespacePath)) {
      const hdinamespaceContent = `{\n\t"name": "",\n\t"subfolder": "ignore"\n}`;
      fs1.writeFileSync(hdinamespacePath, hdinamespaceContent);
    }
    const hdbrolePath = path.join(dirPath, "default_access_role.hdbrole");
    const expectedPrivileges = [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "EXECUTE",
      "CREATE TEMPORARY TABLE",
      "SELECT CDS METADATA",
      "ALTER",
      "CREATE ANY",
    ];
    if (fs1.existsSync(hdbrolePath)) {
      const existingContent = JSON.parse(fs1.readFileSync(hdbrolePath, "utf8"));
      if (
        existingContent.role &&
        existingContent.role.schema_privileges &&
        existingContent.role.schema_privileges[0] &&
        Array.isArray(existingContent.role.schema_privileges[0].privileges)
      ) {
        let currentPrivileges =
          existingContent.role.schema_privileges[0].privileges;
        let missingPrivilege = expectedPrivileges.some(
          (p) => !currentPrivileges.includes(p)
        );
        if (missingPrivilege) {
          existingContent.role.schema_privileges[0].privileges =
            expectedPrivileges;
          fs1.writeFileSync(
            hdbrolePath,
            JSON.stringify(existingContent, null, 2)
          );
        }
      } else {
        existingContent.role = {
          schema_privileges: [{ privileges: expectedPrivileges }],
        };
        fs1.writeFileSync(
          hdbrolePath,
          JSON.stringify(existingContent, null, 2)
        );
      }
    } else {
      fs1.writeFileSync(
        hdbrolePath,
        JSON.stringify(
          {
            role: {
              name: "default_access_role",
              schema_privileges: [{ privileges: expectedPrivileges }],
            },
          },
          null,
          2
        )
      );
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

const createOdata = (pattern) => {
  const contextMappings = {};
  try {
    const cdsFiles = glob.sync(path.join(pattern, "db/cds/**/*.cds"));
    let usingStatements = "";
    let serviceContent = `service catalogService @(requires:'authenticated-user') { \n`;
    cdsFiles.forEach((file) => {
      try {
        const data = fs1.readFileSync(file, "utf8");
        const namespaceMatch = data.match(/namespace\s+([\w\d_.]+)/);
        const namespace = namespaceMatch ? namespaceMatch[1].trim() : null;
        const context = (data.match(/context\s+(.*?){/) || [])[1]?.trim();
        if (!context) return;
        if (!contextMappings[context]) {
          contextMappings[context] = namespace;
          if (namespace) {
            usingStatements += `using { ${namespace}.${context} as ${context} } from '../db/cds/${context}';\n`;
          } else {
            usingStatements += `using { ${context} } from '../db/cds/${context}';\n`;
          }
        }
        const constructs =
          data.match(/(entity|view|Entity|View)\s+(\w+)/g) || [];
        constructs.forEach((construct) => {
          const entityName = construct.replace(
            /(entity|view|Entity|View)\s+/,
            ""
          );
          if (entityName === "on") return;
          const uniqueEntityName = `${context}_${entityName}`;
          serviceContent += `entity ${uniqueEntityName} @(restrict:[{grant:['READ','WRITE'],to:'write'},{grant:'READ',to:'read'}]) as projection on ${context}.${entityName};\n`;
        });
      } catch (readError) {
        console.error(`Error reading file: ${readError.message}`);
      }
    });
    serviceContent += `}`;
    fs1.writeFileSync(
      path.join(pattern, "srv", "service.cds"),
      `${usingStatements}\n${serviceContent.trim()}`,
      "utf8"
    );
    console.log("Service odata  file has been created.");
  } catch (globError) {
    console.error(`Error globbing files: ${globError.message}`);
  }
};

const createFolderAndCopy = (
  CAP_DIR,
  XSA_DIR,
  CONTAINER_NUM,
  paramArray,
  option
) => {
  try {
    for (let i = 0; i < CONTAINER_NUM; i++) {
      if (i === 0) {
        var haas_db_src = XSA_DIR + "/" + paramArray[0];
        var cap_db_dest = CAP_DIR + "/db";
        setup_db(haas_db_src, cap_db_dest, option);
      } else {
        let newFolder = path.join(CAP_DIR, "db" + i);
        if (!fs1.existsSync(newFolder)) {
          fs1.mkdirSync(newFolder);
        }
        var haas_db_src = XSA_DIR + "/" + paramArray[i];
        setup_db(haas_db_src, newFolder, option);
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = setup_db_containers;
