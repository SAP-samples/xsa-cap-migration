'use strict';
const cds = require('@sap/cds');


/**
 * This asynchronous function is responsible for creating a new user.
 * @async
 * @function createUser
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} - Returns a promise that resolves into the request data upon successful creation and rejects with a message on error.
 */

async function createUser(req) {
  try {
    const result = await cds.run('SELECT "USERSEQID".NEXTVAL FROM DUMMY');
    const UserId = result[0]['USERSEQID.NEXTVAL'];
    await INSERT.into('USERDATA_USER').entries({
      USERID: UserId,
      FIRSTNAME: req.data.FirstName,
      LASTNAME: req.data.LastName,
      EMAIL: req.data.Email
    });
    return req.data;
  }
  catch (e) {
    return req.error(
      500,
      `Error in user creation: ${ e.message }`
    )
  }
}

module.exports = { createUser };
