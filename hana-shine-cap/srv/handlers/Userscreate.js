'use strict';

/**
 * This asynchronous function is responsible for creating a new user.
 * @async
 * @function createUser
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} - Returns a promise that resolves into the request data upon successful creation and rejects with a message on error.
 */

async function createUser(req) {
  let usertemp;
  try {
    const values = [
      [ req.data.UserId, req.data.FirstName, req.data.LastName, req.data.Email ]
    ];
    usertemp = `#usertemp_${ cds.utils.uuid().replace(/-/g, '_') }`
    await cds.run(`create local temporary table ${ usertemp } ( UserId INT, FirstName NVARCHAR(40), LastName NVARCHAR(40), Email NVARCHAR(40))`)
    await cds.run(`insert into ${ usertemp } values (?,?,?,?)`, values)
    const query = `CALL "PROCEDURES_USERSCREATEMETHOD"(IM_ROW => ${ usertemp }, EX_ERROR => ?)`;
    await cds.run(query)
    return req.data;
  }
  catch (e) {
    return req.error(
      500,
      `Error in user creation: ${ e.message }`
    )
  }
  finally {
    if (usertemp)
      await cds.run(`DROP TABLE ${ usertemp }`)
  }
}

module.exports = { createUser };
