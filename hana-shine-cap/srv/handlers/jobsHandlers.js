'use strict';

const cds = require('@sap/cds');

/**
 * An asynchronous function to delete all records from "JOBS_DATA" table.
 * @async
 * @function deleteJobData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} A promise that returns status code and message
 */

async function deleteJobData(req) {
  const query = 'truncate table "JOBS_DATA"';
  try {
    await cds.run(query);
    return req.info(
      200,
      'All records in Jobs Data table deleted'
    );
  }
  catch (e) {
    return req.error(
      500,
      `Error during Job deletion: ${ e.message }`
    );
  }
}

/**
 * An asynchronous function to create a new job record.
 * @async
 * @function jobCreate
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise} A promise that returns status code and message
 */

async function jobCreate(req, srv) {
  try {
    const { JOBS_DATA } = srv.entities;
    const query = 'select "JOBID".NEXTVAL as nJobId from "DUMMY"';
    const rows = await cds.run(query);
    const jobid = rows[0].NJOBID;
    const timestamp = new Date().toISOString();

    try {
      await INSERT.into(JOBS_DATA).entries({
        'ID': jobid.toString(),
        'NAME': req.data.jobname,
        'TIMESTAMP': timestamp
      });
      return req.info(
        200,
        'Job Inserted successfully'
      );
    }
    catch (e) {
      return req.error(
        401,
        'Error during Job Insertion! Check the logs for details'
      );
    }
  }
  catch (e) {
    return req.error(
      500,
      `Error during Job creation: ${ e.message }`
    );
  }
}

module.exports = {
  deleteJobData,
  jobCreate
};
