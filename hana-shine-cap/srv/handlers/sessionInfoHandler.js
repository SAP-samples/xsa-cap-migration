'use strict';

/**
 * Gets and stringify the session information for the user.
 * @function getSessionInfo
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {string} - A string of JSON that contains the session information. The JSON includes the user's name and locale.
 */


function getSessionInfo(req) {
  return JSON.stringify({
    'session': [ {
      'UserName': req.user.name,
      'Language': req.user.locale
    } ]
  });
}

module.exports = { getSessionInfo };
