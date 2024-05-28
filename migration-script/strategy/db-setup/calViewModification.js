const shell = require("shelljs");
const fs1 = require("fs");
const path = require("path");

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
        let parsedPath = path.parse(file);
        let cdsDirectoryPath = path.join(process.cwd(), parsedPath.dir);
        fs1.writeFileSync(`${cdsDirectoryPath}/${newNamespace}.cds`, newFileContent);
        return `${keyword1} ${newNamespace} ${asKeyword} ${alias} from './${newNamespace}';`;
      };
      newContent = newContent.replace(regex1, replacer1);
      fs1.writeFileSync(file, newContent);
    });
};
module.exports = calViewModification;
