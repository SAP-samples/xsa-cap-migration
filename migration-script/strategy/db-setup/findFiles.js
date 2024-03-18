const shell = require("shelljs");
const os = require("os");
const fs1 = require("fs");
const path = require("path");

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

module.exports = findFiles;
