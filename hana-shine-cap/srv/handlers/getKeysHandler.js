'use strict';

/**
 * An asynchronous function that retrieves API keys from a MapKeys object.
 * If the API key does not exist, it inserts a new entry with key ID set to '1' and no API key.
 * @async
 * @function getKeys
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} MapKeys - The MapKeys object from which to retrieve the API keys.
 * @returns {Promise} A promise that resolves to an object containing an API key or an empty string or rejects with a message in case of error.
 */

async function getKeys(req, MapKeys) {
  try {
    const output = {
      entry: {}
    };
    const apikey = await SELECT.one.from(MapKeys).columns('API_KEY');
    if (apikey == null) {
      await INSERT.into(MapKeys).entries({
        'KEYID': '1'
      });
      output.entry.API_KEY = '';
    }
    else {
      output.entry.API_KEY = apikey.API_KEY;
    }
    return output;
  }
  catch (e) {
    return req.error(
      500,
      `Failed to retrieve the key: ${ e.message }`
    )
  }
}

module.exports = { getKeys };
