'use strict';

/**
 * An asynchronous function that get and stringify the user's session information.
 * @async
 * @function getUserSessionInfo
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} A promise that returns a JSON string containing user session info. The key is 'userEncoded' with its value being the user's id.
 */
async function getUserSessionInfo(req) {
  return JSON.stringify({
    'userEncoded': req.user.id
  });
}

module.exports = { getUserSessionInfo };
