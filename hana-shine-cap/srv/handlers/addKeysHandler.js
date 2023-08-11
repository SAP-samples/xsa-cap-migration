'use strict';

/**
* This asynchronous function deletes the existing key values and inserts new key values into "MapKeys".
* It returns a success message if the insertion is successful. If there is an error during the deletion or insertion database operations, an HTTP 500 status code and a custom error message are sent.
* @async
* @function addKeys
* @param {Object} req - The request object carrying all details of the incoming request.
* @param {Object} MapKeys - This is the representation of the "MapKeys" entity from the service definition.
* @returns {Promise} - A promise resolving to the request's response message object.
*/

async function addKeys(req, MapKeys) {
  try {
    await DELETE.from(MapKeys);
  }
  catch (e) {
    return req.error(
      500,
      `Failed to delete existing keys: ${ e.message }`
    );
  }
  try {
    await INSERT.into(MapKeys).entries({
      'KEYID': '1',
      'API_KEY': req.data.API_KEY
    });
  }
  catch (e) {
    return req.error(
      500,
      `Failed to insert API key: ${ e.message }`
    );
  }
  return req.info(
    200,
    'API Key Inserted successfully'
  );
}

module.exports = { addKeys };
