'use strict';
const util = require('../util');
const jobsc = require('@sap/jobs-client');

/**
 * This asynchronous function creates a job schedule and inserts it into the "JOBS_SCHEDULEDETAILS"
 * table based on the data passed through the `req` object parameters.
 * @async
 * @function createJobSchedule
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} JOBS_SCHEDULEDETAILS - The representation of the "JOBS_SCHEDULEDETAILS" entity from the service definition.
 * @returns {Promise|string} - A promise that gets resolved with the job name (jname) or an error string if an error occurs.
*/

async function createJobSchedule(req, JOBS_SCHEDULEDETAILS) {
  try {
    const jname = req.data.jobname;
    if (!(util.isAlphaNumeric(jname))) {
      return req.error(
        500,
        'Invalid Job Name'
      );
    }
    const description = req.data.description;
    if (!(util.isAlphaNumericAndSpace(description))) {
      return req.error(
        500,
        'Invalid Job Description'
      );
    }
    const startTime = req.data.starttime;
    if (!(util.isValidDate(startTime))) {
      return req.error(
        500,
        'Invalid Start Time'
      );
    }
    const endTime = req.data.endtime;
    if (!(util.isValidDate(endTime))) {
      return req.error(
        500,
        'Invalid End Time'
      );
    }
    const cron = req.data.cron;
    if (cron == null || cron === undefined || cron === '') {
      return req.error(
        500,
        'Invalid CRON'
      );
    }
    const options = util.appconfig();
    const appDetails = JSON.parse(process.env.VCAP_APPLICATION);
    const appURIs = appDetails.application_uris;
    const appUrl = 'https://' + appURIs[0] + "/v2/shine/jobCreate?jobname='" + jname + "'";
    const myJob = {
      'name': jname,
      description,
      'action': appUrl,
      'active': true,
      'httpMethod': 'GET',
      'schedules': [ {
        'cron': cron,
        description,
        'active': true,
        'startTime': {
          'date': startTime,
          'format': 'YYYY-MM-DD HH:mm:ss Z'
        },
        'endTime': {
          'date': endTime,
          'format': 'YYYY-MM-DD HH:mm:ss Z'
        }
      } ]
    };
    const scheduler = new jobsc.Scheduler(options);
    const scJob = {
      job: myJob
    };
    return new Promise((resolve, reject) => {
      scheduler.createJob(scJob, async (error, body) => {
        if (error) {
          if ((error.message).includes('xscron'))
            reject('Invalid xscron');

          reject(error);
        }
        const jobentry = {
          JOBID: body._id.toString(),
          NAME: jname,
          STARTTIME: startTime.split(' ')[0] + ' ' + startTime.split(' ')[1],
          ENDTIME: endTime.split(' ')[0] + ' ' + endTime.split(' ')[1],
          CRON: cron,
          SCHEDULE: body.schedules[0].scheduleId
        };
        try {
          await INSERT.into(JOBS_SCHEDULEDETAILS).entries(jobentry);
          resolve(jname);
        }
        catch (er) {
          reject(er);
        }
      });
    });
  }
  catch (e) {
    return req.error(
      500,
      `Error in createJobSchedule: ${ e.message }`
    );
  }
}

module.exports = { createJobSchedule };
