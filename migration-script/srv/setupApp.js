const fsExtra = require("fs-extra");

const setup_app = (CAP_DIR, XSA_DIR, APPNAME) => {
  try {
    var haas_app_src = XSA_DIR + "/" + APPNAME;
    var cap_app_dest = CAP_DIR + "/app";
    console.log("Copying UI artifacts to CAP project...");
    fsExtra.copySync(haas_app_src, cap_app_dest);
    console.log("Files copied!");
  } catch (e) {
    console.error(`Failed to copy files with error ${e}`);
  }
};

module.exports = setup_app;
