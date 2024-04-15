const shell = require("shelljs");
const fsExtra = require("fs-extra");
const fs = require('fs');

const modifyHdiNamespace = require("./modifyHdiNamespace");
const convertHdbcdsToCds = require("./convertHdbcdsToCds");
const calViewModification = require("./calViewModification");
const changeDataTypes = require("./changeDataTypes");
const formatRoleandTabledata = require("./formatRoleAndTabledata");
const moveAndIndexCds = require("./moveAndIndexCds");
const formatSynonymConfig = require("./formatSynonymConfig");
const processFolder = require("./processFolder");
const {
  replaceSimpleUsingInFiles,
  replaceUsingInFiles,
} = require("./replaceFiles");
const structuredPrivilege = require("./structuredPrivilege");
const removeSeriesFunction = require("./removeSeriesFunction");
const technicalConfig = require("./technicalConfig");
const {
  commentAnnotation,
  annotationUpdate,
  removeAnnotation,
  modifyUIAnnotation
} = require("./annotationChanges");
const updateSchema = require("./updateSchema");
const findFiles = require("./findFiles");
const convertHdbtableToCds = require("./convertHdbtableToCds");
const convertHdbviewToCds = require("./convertHdbviewToCds");
const inlineConfig = require("./inlineConfig");

const setup_db = async (source, destination, option) => {
  try {
    console.log("Copying db artifacts to CAP project...");
    copyDbFiles(source, destination);
    console.log("Files copied!");
    console.log("Modify the .hdinamespace files");
    modifyHdiNamespace(destination);
    console.log("Convert hdbcds to cds");
    convertHdbcdsToCds(".", ".hdbcds", ".cds");
    console.log("Convert hdbtable to cds");
    convertHdbtableToCds(".", ".hdbtable")
    // console.log("Convert hdbviews to cds");
    // convertHdbviewToCds(".", ".hdbview")
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
    // console.log("Remove 'generated...;' and following in all lines");
    // removeGenerated();
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
    console.log("Modify inline configurations");
    inlineConfig(".");
    console.log("Update the Structure privilege check");
    structuredPrivilege(".");
    console.log("Remove Series Entity");
    removeSeriesFunction(".");
    console.log("Replace @Comment with /* */");
    commentAnnotation(".");
    console.log("Remove annotations file");
    removeAnnotation(".");
    console.log("Changing @UI annotations");
    modifyUIAnnotation(".");
    // console.log("Modify the annotation syntax");
    // annotationUpdate("./cds");
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

const modifyViewNotation = () => {
  const standaloneBeforeAsPattern = /([^a-zA-Z0-9_])"([^"]+)"(?=\s+as\s+)/g;
  const asPattern = /(\S+)\s+as\s+"([^"]+)"/g;
  const secondAsPattern = /"([^"]+)"\s+as\s+"([^"]+)"/g;
  const dotPattern = /(\.\s*)"([^"]+)"/g;
  const standalonePattern = /([^a-zA-Z0-9_])"([^"]+)"(?!\s+as\s+)/g;
  shell
    .find(".")
    .filter((file) => file.endsWith(".cds"))
    .forEach((file) => {
      let content = fs.readFileSync(file, 'utf8');
      const modifiedContent = content
        .replace(standaloneBeforeAsPattern, '$1![$2]')
        .replace(asPattern, '$1 as ![$2]')
        .replace(secondAsPattern, '![$1] as ![$2]')
        .replace(dotPattern, '$1![$2]')
        .replace(standalonePattern, '$1 ![$2]');

      fs.writeFileSync(file, modifiedContent);
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

// const removeGenerated = () => {
//   shell
//     .find(".")
//     .filter((file) => file.endsWith(".cds"))
//     .forEach((file) => {
//       shell.exec(
//         `sh -c "cat ${file} | sed -e 's/generated always.*;/;/g' > ${file}.cases; mv ${file}.cases ${file};"`
//       );
//     });
// };

module.exports = setup_db;
