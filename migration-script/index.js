const setup_cap_project = require("./strategy/setupCapProject")
const getParams = require("./strategy/getParameters");
const setup_db_containers = require("./strategy/db-setup/setDbContainers");
const mtaandxsuaa = require("./strategy/mtaandxsuaa");
const setup_app = require("./strategy/setupApp");
const odataV2Support = require("./strategy/supportOdata");
const buildTasks = require("./strategy/addBuildTasks");
const callcalculation = require("./strategy/callCalculation");
const compileAndRedirect = require("./strategy/compileAndRedirect");
const formatcds = require("./strategy/formatCds");
const technicalConfig = require("./strategy/db-setup/technicalConfig");
const addDeployFormat = require("./strategy/addDeployFormat");
const { hanaDbConnection, disconnectConnection } = require("./config/hanaDbConnection");

const main = async () => {
  try {
    var CURR_DIR = process.cwd();
    await getParams();
    var CAP_DIR, XSA_DIR, CONTAINER_NUM, paramArray, APPNAME, option;
    CAP_DIR = process.env.CAP_DIR;
    XSA_DIR = process.env.XSA_DIR;
    CONTAINER_NUM = process.env.CONTAINER_NUM;
    paramArray = JSON.parse(process.env.DBARRAY || 0);
    APPNAME = process.env.APP;
    option = process.env.option || 0;
    if (option == 3) technicalConfig(CAP_DIR, option);
    await hanaDbConnection();
    setup_cap_project(CAP_DIR);
    await setup_db_containers(CAP_DIR, XSA_DIR, CONTAINER_NUM, paramArray, option);
    mtaandxsuaa(CAP_DIR);
    setup_app(CAP_DIR, XSA_DIR, APPNAME);
    odataV2Support(CAP_DIR);
    buildTasks(CONTAINER_NUM);
    addDeployFormat(option);
    callcalculation(CURR_DIR, CAP_DIR);
    //compileAndRedirect(CAP_DIR);
    formatcds(CAP_DIR);
    await disconnectConnection();
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

main();
