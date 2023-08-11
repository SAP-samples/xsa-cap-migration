'use strict';
const util = require('../util');
const jobsc = require('@sap/jobs-client');

/**
* Deletes a scheduled job and also deletes the entry from JOBS_SCHEDULEDETAILS table.
* @async
* @function deleteJobSchedule
* @param {Object} req - The request object carrying all details of the incoming request.
* @param {Object} JOBS_SCHEDULEDETAILS - The representation of the "JOBS_SCHEDULEDETAILS" entity from the service definition.
* @returns {Promise|string} A promise that resolves to a string indicating operation success or error message upon deletion of a scheduled job.
*/

async function deleteJobSchedule(req, JOBS_SCHEDULEDETAILS) {
  try {
    const jobId = req.data.jobId;
    const options = util.appconfig();
    const rows = await SELECT.one.from(JOBS_SCHEDULEDETAILS).columns('NAME', 'SCHEDULE').where({ JOBID: jobId });
    const scheduleId = rows.SCHEDULE;
    const jobName = rows.NAME;
    const myJob = {
      'jobId': jobId,
      'scheduleId': scheduleId
    };
    const scheduler = new jobsc.Scheduler(options);
    await new Promise((resolve, reject) => {
      scheduler.deleteJob(myJob, async (error) => {
        if (error) {
          reject('Error deleting new job in Scheduler');
        }
        else {
          await DELETE.from(JOBS_SCHEDULEDETAILS).where({ JOBID: jobId });
          resolve();
        }
      });
    });
    return 'Schedule for job ' + jobName + ' is deleted';
  }
  catch (e) {
    return req.reject(
      500,
      `Error in deleteJobSchedule: ${ e.message }`
    );
  }
}

module.exports = { deleteJobSchedule };
