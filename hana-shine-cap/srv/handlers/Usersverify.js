'use strict';

/**
 * This function is responsible for verifying that an email address is valid.
 * @async
 * @function verifyEmail
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @returns {Promise} - A promise which resolves with 'true' if the email is valid, or rejects with an error message if the email is invalid.
*/

async function verifyEmail(req) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!re.test(req.data.Email))
    return req.error(400, 'E-Mail must be valid');

  return true;
}

module.exports = { verifyEmail };
