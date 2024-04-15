const glob = require("glob");
const StrategyFactory = require("../renameStrategy/factoryStrategy");
const fs1 = require("fs");
const path = require("path");

const callcalculation = (CURR_DIR, CAP_DIR) => {
  try {
    process.chdir(CURR_DIR);
    let data = fs1.readFileSync("config.json.tpl", "utf-8");
    let tempCAP_DIR;
    if (process.platform === 'win32' || process.platform === 'win64') {
      tempCAP_DIR = CAP_DIR + '\\**';
      tempCAP_DIR.replace(/\\/g, '\\\\');
      let jsonData = JSON.parse(data);
      jsonData.scanPath = tempCAP_DIR;
      fs1.writeFileSync("config.json", JSON.stringify(jsonData, null, 2), "utf-8");
    }
    else {
      tempCAP_DIR = CAP_DIR + '/**';
      data = data.replace(/\{CAP_DIR\}/g, tempCAP_DIR);
      fs1.writeFileSync("config.json", data, "utf-8");
    }
    const configPath = "config.json";
    const config = JSON.parse(fs1.readFileSync(configPath));
    const migrations = config.migrations;
    migrations.forEach((migration) => {
      const fileExts = migration.fileExts;
      const strategies = migration.strategies;
      fileExts.forEach((ext) => {
        let scanPathGlob;
        if (process.platform === 'win32' || process.platform === 'win64') {
          scanPathGlob = path.join(config.scanPath, '*');
          scanPathGlob = scanPathGlob.replace(/\\/g, '/');
        }
        else {
          scanPathGlob = `${config.scanPath}/*`
        }
        glob(
          `${scanPathGlob}.${ext}`,
          { ignore: config.ignorePaths },
          function (err, files) {
            files.forEach((file) => {
              strategies.forEach((strategy) => {
                const strategyName = strategy.name;
                const strategyConfig = strategy.config;
                let strategyObj = StrategyFactory.get(strategyName);
                if (strategyObj) {
                  console.log(`Applying strategy ${strategyName} to ${file}...`);
                  let fileContent = fs1.readFileSync(file).toString();
                  strategyObj.configure(strategyConfig);
                  let modifiedContent = strategyObj.process(fileContent);
                  fs1.writeFileSync(file + config.fileExt, modifiedContent);
                } else {
                  console.log(`Strategy ${strategyName} not found. Skipping file ${file}`);
                }
              });
            });
          }
        );
      });
    });
  } catch (error) {
    console.error(`Call Calculation Error: ${error}`);
  }
};

module.exports = callcalculation;