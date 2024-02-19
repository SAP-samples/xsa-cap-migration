const fs1 = require("fs");

const buildTasks = (CONTAINER_NUM) => {
  try {
    console.log("Add Build tasks");
    const data = fs1.readFileSync("package.json", "utf8");
    const packageJson = JSON.parse(data);
    if (!packageJson.cds) {
      packageJson.cds = {};
    }
    packageJson.cds.build = {
      target: "gen",
      tasks: [],
    };
    for (let i = 0; i < CONTAINER_NUM; i++) {
      let newTask = {
        for: "hana",
        src: i === 0 ? "db" : "db" + i,
        options: {
          model:
            i === 0 ? ["srv", "app", "db/cds"] : ["db" + i, "db" + i + "/cds"],
        },
      };
      packageJson.cds.build.tasks.push(newTask);
    }
    packageJson.cds.build.tasks.push({
      for: "nodejs",
      src: "srv",
      options: {
        model: ["db", "srv", "app"],
      },
    });
    fs1.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
    console.log("Successfully Added Build tasks");
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

module.exports = buildTasks;
