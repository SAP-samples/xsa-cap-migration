const shell = require("shelljs");
const fs1 = require("fs");

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

module.exports = { replaceSimpleUsingInFiles, replaceUsingInFiles };
