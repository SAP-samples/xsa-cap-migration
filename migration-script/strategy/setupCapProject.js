const fs1 = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const setup_cap_project = (CAP_DIR) => {
  console.log("Initializing CAP project...");
  if (!fs1.existsSync(CAP_DIR)) {
    fs1.mkdirSync(CAP_DIR, { recursive: true });
  }
  process.chdir(CAP_DIR);
  const CAP_PATH = path.resolve(process.cwd());
  if (!fs1.existsSync(`${CAP_PATH}/package.json`)) {
    execSync("cds init", { stdio: "inherit" });
  } else {
    console.log(
      "There's already a package.json file in the CAP directory. New cds project won't be created."
    );
  }
  process.chdir("../");
};

module.exports = setup_cap_project;
