const readline = require('readline');
const fs1 = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const util = require('util');
const ncp = util.promisify(require('ncp'));
const mkdir = util.promisify(fs1.mkdir);
const shell = require('shelljs');
const glob = require('glob');
const StrategyFactory = require("./renameStrategy/factoryStrategy");

async function askQuestion(query) {
  try{
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  
    return new Promise(resolve =>
      rl.question(query, ans => {
        rl.close();
        resolve(ans);
      })
    );
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

async function getParams() {
  try{
    const cap = await askQuestion('Enter the path of the CAP project to be created (It should contain the CAP Folder name as well): ');
    process.env.CAP_DIR = cap;
    const haas = await askQuestion('Enter the path of the XSA project: ');
    process.env.XSA_DIR = haas;
    const container = parseInt(await askQuestion('Enter the number of containers in the project: '));
    if(!isNaN(container)){
      process.env.CONTAINER_NUM = container;
    } else {
      console.log("Invalid input!! Please enter a valid number");
      return await getParams();
    }
    var dbArray = [];
    for (let i = 1; i <= container; i++) {
      const dbfolder = await askQuestion(`Enter the name of the folder that has the container data ${i}: `);
      dbArray.push(dbfolder);
    }
    process.env.DBARRAY = JSON.stringify(dbArray);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const setup_cap_project = async(CAP_DIR) => {
  console.log('Initializing CAP project...');
  if (!fs1.existsSync(CAP_DIR)) {
    fs1.mkdirSync(CAP_DIR, { recursive: true });
  }
  process.chdir(CAP_DIR);
  const CAP_PATH = path.resolve(process.cwd());
  if (!fs1.existsSync(`${CAP_PATH}/package.json`)) {
    await execSync('cds init', { stdio: 'inherit' });
  } else {
    console.log('There\'s already a package.json file in the CAP directory. New cds project won\'t be created.');
  }
  process.chdir('../');
}

const setup_db_containers = async(CAP_DIR,XSA_DIR,CONTAINER_NUM,paramArray) => {
  try {
    if(CONTAINER_NUM == 1){
      var haas_db_src = XSA_DIR + "/" + paramArray[0];
      var cap_db_dest = CAP_DIR + "/db";
      await setup_db(haas_db_src, cap_db_dest);
    } else if (CONTAINER_NUM > 1) {
      await createFolderAndCopy(CAP_DIR,XSA_DIR,CONTAINER_NUM,paramArray);
    }
    await execSync('cds add hana', { stdio: 'inherit' });
    console.log('Successfully added hana');
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const setup_db = async(source, destination) => {
  try {
    console.log("Copying db artifacts to CAP project...");
    await ncp(source, destination);
    console.log('Files copied!');
    process.chdir(destination);
    console.log("Convert hdbcds to cds");
    await renameFiles('.', '.hdbcds', '.cds').catch(console.error);
    console.log("Modify the view notation");
    await shell.find('.')
      .filter(file => file.endsWith('.cds'))
      .forEach(file => {
        shell.exec(`sh -c "cat ${file} | sed -e 's/\\"/\\![/; s/\\"/]/' > ${file}.cases; mv ${file}.cases ${file};"`);
        shell.exec(`sh -c "cat ${file} | sed -e 's/\\"/\\![/; s/\\"/]/' > ${file}.cases; mv ${file}.cases ${file};"`);
    });
    console.log("Change Datatypes");
    await shell.find('.')
    .filter(file => file.endsWith('.cds'))
    .forEach(file => {
      shell.exec(`sh -c "cat ${file} |
          sed -e 's/LocalDate/Date/g' |
          sed -e 's/LocalTime/Time/g' |
          sed -e 's/UTCDateTime/DateTime/g' |
          sed -e 's/UTCTimestamp/Timestamp/g' |
          sed -e 's/BinaryFloat/Double/g' > ${file}.newtypes; mv ${file}.newtypes ${file};"`)
    });
    console.log("Change table type to type and table Type to Type");
    await shell.find('.').filter((file) => file.endsWith('.cds')).forEach((file) => {
      shell.exec(`sh -c "cat ${file} | sed -e 's/table type/type/g' > ${file}.cases; mv ${file}.cases ${file};"`);
      shell.exec(`sh -c "cat ${file} | sed -e 's/table Type/Type/g' > ${file}.cases; mv ${file}.cases ${file};"`);
    });
    console.log("Comment or remove the deprecated functionalities");
    await shell.find('.').filter(file => file.endsWith('.cds')).forEach(file => {
      shell.exec(`sh -c "cat ${file} | sed -e 's@temporary Entity@\\/\\* temporary \\*\\/ Entity@g' > ${file}.cases; mv ${file}.cases ${file};"`);
    });
    console.log("Replace @OData.publish:true with @cds.autoexpose");
    await shell.find('.').filter(function(file) { 
      return file.endsWith('.cds'); 
    }).forEach(function(file){
      shell.sed('-i', /@OData\.publish\s*:*\s*true/g, '@cds.autoexpose', file);
    });
    console.log("Replace @Comment with @title");
    await shell.find('.').filter(file => file.endsWith('.cds')).forEach(file =>{
      shell.exec(`sh -c "cat ${file} | sed -e 's/@Comment/@title/g' > ${file}.cases; mv ${file}.cases ${file};"`);
    });
    console.log("Move the cds files to db folder");
    await shell.find('.').filter(file => file.endsWith('.cds')).forEach(file => {
      shell.mv(file, '.');
    });
    console.log("Compile the cds files and create a log file");
    await findFiles('.');
    process.chdir('../');
  } catch(e){
    console.error(`Failed to copy with error ${e}`);
  }
}

const findFiles = async(dir) => {
  try{
    const outDir = path.resolve(dir, '../logs');
    if (!fs1.existsSync(outDir)) {
      fs1.mkdirSync(outDir);
    }
    let files = await shell.ls('-Rl', `${dir}/*.cds`);
    for(const file of files) {
      let tmp = '/tmp/shelljs_' + Math.random().toString().slice(2);
      await shell.exec(`cds compile ${file.name} 2> ${tmp}`, { silent: true });
      if (fs1.statSync(tmp).size !== 0) {
        await shell.mv(tmp, path.join(outDir, `${path.basename(file.name)}.errors.log`));
      } else {
        await shell.rm(tmp);
      }
    };
  } catch(e){
    console.error(`Failed to copy with error ${e}`);
  }
}

const renameFiles = async(directory, oldExtension, newExtension) => {
  try {
    const files = await fs1.promises.readdir(directory, { withFileTypes: true });
    for (let file of files) {
      if (file.isDirectory()) {
        await renameFiles(path.join(directory, file.name), oldExtension, newExtension);
      } else if (path.extname(file.name) === oldExtension) {
        const oldFileName = path.join(directory, file.name);
        const newFileName = path.join(directory, path.basename(file.name, oldExtension) + newExtension);
        await fs1.promises.rename(oldFileName, newFileName);
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const createFolderAndCopy = async(CAP_DIR,XSA_DIR,CONTAINER_NUM,paramArray) => {
  try{
    for(let i = 0; i < CONTAINER_NUM; i++){
      if(i === 0){
        var haas_db_src = XSA_DIR + "/" + paramArray[0];
        var cap_db_dest = CAP_DIR + "/db";
        await setup_db(haas_db_src, cap_db_dest);
      } else {
        let newFolder = path.join(CAP_DIR, 'db'+ i);
        if (!fs1.existsSync(newFolder)){
          await mkdir(newFolder);
        }
        var haas_db_src = XSA_DIR + "/" + paramArray[i];
        await setup_db(haas_db_src, newFolder);
      }
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const callcalculation = async(CURR_DIR, CAP_DIR) => {
  try{
    process.chdir(CURR_DIR);
    let data = await fs1.readFileSync('config.json.tpl', 'utf-8');
    data = data.replace(/\{CAP_DIR\}/g, CAP_DIR);
    await fs1.writeFileSync('config.json', data, 'utf-8');
    const configPath = 'config.json';
    const config = JSON.parse(fs1.readFileSync(configPath));
    const migrations = config.migrations;
    migrations.forEach(migration => {
      const fileExts = migration.fileExts;
      const strategies = migration.strategies;
      fileExts.forEach(ext => {
        glob(`${config.scanPath}/*.${ext}`, {"ignore": config.ignorePaths}, function(err, files){
          files.forEach(file => {
            strategies.forEach(strategy => {
              const strategyName = strategy.name;
              const strategyConfig = strategy.config;
              let strategyObj = StrategyFactory.get(strategyName);
              if(strategyObj){
                console.log(`Applying strategy ${strategyName} to ${file}...`);
                let fileContent = fs1.readFileSync(file).toString();
                strategyObj.configure(strategyConfig)
                let modifiedContent = strategyObj.process(fileContent);
                fs1.writeFileSync(file + config.fileExt, modifiedContent);
              }else{
                console.log(`Strategy ${strategyName} not found. Skipping file ${file}`)
              }
            });
          });
        });
      });
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const copyserver = async() => {
  try{
    console.log("Install odata proxy and create server.js file")
    await execSync('npm install @sap/cds-odata-v2-adapter-proxy', { stdio: 'inherit' });
    const dir = './srv';
    const data = `const proxy = require('@sap/cds-odata-v2-adapter-proxy');
    const cds = require('@sap/cds');
    cds.on('bootstrap', app => app.use(proxy()));
    module.exports = cds.server;`;
    if (!fs1.existsSync(dir)){
      fs1.mkdirSync(dir);
    }
    fs1.writeFile(path.join(dir, 'server.js'), data, (err) => {
      if (err) {
        console.error('Error writing file:', err);
      }
    });
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const mtaandxsuaa = async() => {
  try{
    await execSync('cds add xsuaa', { stdio: 'inherit' });
    console.log('Successfully added xsuaa');
    await execSync('cds add mta', { stdio: 'inherit' });
    console.log('Successfully added mta');
    if (!fs1.existsSync('node_modules')) {
      console.log("node_modules directory does not exist, installing...");
      await execSync('npm install', { stdio: 'inherit' });
      console.log('Successfully installed node packages');
    } else {
      console.log("node_modules directory exists.");
    }
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

const main = async() => {
  try{
    var CURR_DIR = process.cwd();
    await getParams();
    var CAP_DIR, XSA_DIR, CONTAINER_NUM, paramArray;
    CAP_DIR = process.env.CAP_DIR;
    XSA_DIR = process.env.XSA_DIR;
    CONTAINER_NUM = process.env.CONTAINER_NUM;
    paramArray = JSON.parse(process.env.DBARRAY);
    await setup_cap_project(CAP_DIR);
    await setup_db_containers(CAP_DIR,XSA_DIR,CONTAINER_NUM,paramArray);
    await mtaandxsuaa();
    await callcalculation(CURR_DIR, CAP_DIR);
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

main();
