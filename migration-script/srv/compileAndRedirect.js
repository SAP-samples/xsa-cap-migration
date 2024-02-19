const glob = require("glob");
const fs1 = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const compileAndRedirect = async (pattern) => {
  const srcPath = path.join(pattern, "srv");
  const srvPath = path.join(srcPath, "**", "*.cds");
  let stderr;
  try {
    const { stdout, stderr: compileError } = await execSync(
      `npx cds compile ${srcPath}`
    );
    stderr = compileError;
    if (!stderr) {
      console.log("Compilation Success.");
      return;
    }
  } catch (error) {
    stderr = error.stderr;
    //console.log(`Compilation errors:\n${stderr}`);
  }

  const redirectionError = /to select the entity as redirection target/.test(
    stderr
  );
  const removeRedirectionError =
    /Remove “@cds.redirection.target” from all but one of/.test(stderr);

  if (redirectionError || removeRedirectionError) {
    const serviceNamePattern = redirectionError
      ? /target for .*“(.*?)”.*auto-redirect “(.*?)”.*\(in entity:“(.*?)”\)/gm
      : /Remove “@cds.redirection.target” from all but one of .*“(.*?)” in /gm;

    let match;
    const matches = [];
    while ((match = serviceNamePattern.exec(stderr.toString())) !== null) {
      matches.push(match);
    }

    const files = glob.sync(srvPath);
    for (let match of matches) {
      const serviceName = match[3].replace(/\"/g, "").split(".").pop();
      let targetAdded = false;

      const newFileContents = files.map((filePath) => {
        let fileContent = fs1.readFileSync(filePath, "utf-8");
        let lines = fileContent.split("\n");

        const newLines = lines.map((line) => {
          let newLine = line;
          if (newLine.startsWith(`entity ${serviceName}`)) {
            if (
              removeRedirectionError &&
              newLine.includes("@cds.redirection.target")
            ) {
              newLine = newLine.replace("@cds.redirection.target ", "");
            } else if (
              redirectionError &&
              !newLine.includes("@cds.redirection.target") &&
              !targetAdded
            ) {
              newLine = `@cds.redirection.target ${newLine}`;
              targetAdded = true;
            }
          }
          return newLine;
        });

        return newLines.join("\n");
      });

      const changesMade = newFileContents.some((newContent, index) => {
        const filePath = files[index];
        if (fs1.readFileSync(filePath, "utf-8") !== newContent) {
          fs1.writeFileSync(filePath, newContent, "utf8");
          console.log(`Updated ${serviceName}`);
          return true;
        }
        return false;
      });

      if (changesMade) {
        compileAndRedirect(pattern);
        return;
      }
    }
  } else {
    console.error(
      "Compilation failed with unhandled errors, Please check the logs"
    );
  }
};

module.exports = compileAndRedirect;
