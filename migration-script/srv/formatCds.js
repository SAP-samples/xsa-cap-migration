const { execSync } = require("child_process");
const path = require("path");

const formatcds = async (directory) => {
  try {
    let absDirectory = path.resolve(directory);
    execSync("format-cds --init", { stdio: "inherit", cwd: absDirectory });
    execSync("format-cds --force", { stdio: "inherit", cwd: absDirectory });
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
};

module.exports = formatcds;
