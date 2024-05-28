require("dotenv").config()
const {createConnection} = require("@sap/hana-client")
const util = require('util');


let connection = createConnection();
const hanaDbConnection = async () => {
    const connParams = {
        host: process.env.HANA_HOST,
        port: process.env.HANA_SQL_PORT,
        user: process.env.HANA_USER,
        password: process.env.HANA_PASSWD,
        sslValidateCertificate: false
    };
    if (process.env.BAS_DEFAULT_NODEJS_VERSION) {
        const pp = Buffer.from(process.env.LOCATION_ID, "utf-8").toString("base64");
        connParams.proxy_host = "127.0.0.1";
        connParams.proxy_port = "20004";
        connParams.proxy_userid = "";
        connParams.proxy_password = pp;
    }
    let connectPromise = util.promisify(connection.connect).bind(connection);
    try {
        await connectPromise(connParams);
        console.log("DB CONNECTION ESTABLISHED");
    } catch (error) {
        console.error('hdb-client-helper prepareAndConnect Error:' + error.message);
    }
   
}

const disconnectConnection = async() =>{
    try {
        connection.disconnect();
        console.log("DB CONNECTION DISCONNECTED")
    } catch (error) {
        console.error('hdb-client-helper disconnect Error', error);
    }
}
module.exports = {hanaDbConnection,connection,disconnectConnection}



