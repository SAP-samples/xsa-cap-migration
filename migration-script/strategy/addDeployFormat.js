// const fs1 = require("fs")

// const addDeployFormat = (options) => {
//     try {
//         console.log("Add Hdbcds Format tasks");
//         const data = fs1.readFileSync("package.json", "utf8");
//         const packageJson = JSON.parse(data);
//         const option = [null, 'hdbcds', 'hdbtable','hdbtable'];

//         if (options >= 1 && options <= 3) {
//             if (!packageJson.cds) {
//                 packageJson.cds = {};
//             }
//             if (!packageJson.cds.hana) {
//                 packageJson.cds.hana = {};
//             }
//             packageJson.cds.hana['deploy-format'] = option[options];
//         }
//         fs1.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
//         console.log("Successfully Added Hdbcds Format tasks");
//     } catch (error) {
//         console.error(`Error: ${error}`);
//     }
// }


// module.exports = addDeployFormat;