const readline = require("readline");

async function getParams() {
  try {
    const questionOP =
      "Choose your migration path:" +
      "\n" +
      "1. XSA to CAP" +
      "\n" +
      "2. XSC to CAP" +
      "\n" +
      "Enter 1 or 2: ";
    // "3. hdbcds to hdbtable (Assuming already in hdbcds format)" +
    // "\n" +
    // "Enter 1 or 2 or 3: ";
    const option = await askQuestion(questionOP);
    // if (!isNaN(option) && (option == 1 || option == 2 || option == 3)) {
    if (!isNaN(option) && (option == 1 || option == 2)) {
      process.env.option = option;
    } else {
      // console.log("Invalid input!! Please enter either 1 or 2 or 3");
      console.log("Invalid input!! Please enter either 1 or 2");
      return await getParams();
    }
    const cap = await askQuestion(
      "Enter the path of the CAP project to be created (It should contain the CAP Folder name as well): "
    );
    process.env.CAP_DIR = cap;
    const haasPrompt =
      // if (process.env.OPTION !== "3") {
      //   const haasPrompt =
      process.env.OPTION == 2
        ? "Enter the path of the XSA project generated after running the migration assistant for XSC: "
        : "Enter the path of the XSA project: ";
    const haas = await askQuestion(haasPrompt);
    process.env.XSA_DIR = haas;
    const container = parseInt(
      await askQuestion("Enter the number of containers in the project: ")
    );
    if (!isNaN(container)) {
      process.env.CONTAINER_NUM = container;
    } else {
      console.log("Invalid input!! Please enter a valid number");
      return await getParams();
    }
    var dbArray = [];
    for (let i = 1; i <= container; i++) {
      const dbfolder = await askQuestion(
        `Enter the name of the folder that has the container data ${i}: `
        // const container = parseInt(
        //   await askQuestion("Enter the number of containers in the project: ")
        // );
        // if (!isNaN(container)) {
        //   process.env.CONTAINER_NUM = container;
        // } else {
        //   console.log("Invalid input!! Please enter a valid number");
        //   return await getParams();
        // }
        // var dbArray = [];
        // for (let i = 1; i <= container; i++) {
        //   const dbfolder = await askQuestion(
        //     `Enter the name of the folder that has the container data ${i}: `
        //   );
        //   dbArray.push(dbfolder);
        // }
        // process.env.DBARRAY = JSON.stringify(dbArray);
        // const ui = await askQuestion(
        //   "Enter the name of the folder containing the UI module in XSA project: "
      );
      dbArray.push(dbfolder);
      // process.env.APP = ui;
    }
    process.env.DBARRAY = JSON.stringify(dbArray);
    const ui = await askQuestion(
      "Enter the name of the folder containing the UI module in XSA project: "
    );
    process.env.APP = ui;
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

async function askQuestion(query) {
  try {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) =>
      rl.question(query, (ans) => {
        rl.close();
        resolve(ans);
      })
    );
  } catch (error) {
    console.error(`Error: ${error}`);
  }
}

module.exports = getParams;
