'use strict';

/**
 * An asynchronous function that retrieves all business partners data from the database and builds an object with the results.
 * @async
 * @function getAllBusinessPartnersData
 * @param {Object} req - The request object carrying all details of the incoming request.
 * @param {Object} srv - The CAP service Object.
 * @returns {Promise} A promise that resolves to an object containing all business partners data.
*/

async function getAllBusinessPartnersData(req, srv) {
  try {
    const { Spatial_Address } = srv.entities;

    const result = await SELECT.from(Spatial_Address).columns([ 'PARTNERID', 'EMAILADDRESS', 'PHONENUMBER', 'WEBADDRESS', 'COMPANYNAME', 'LEGALFORM', 'BUILDING', 'STREET', 'CITY', 'POSTALCODE', 'COUNTRY', 'REGION', 'LATITUDE', 'LONGITUDE' ]);

    if (result.length < 1) {
      return req.error(
        500,
        'Failed to retrieve All BP Transaction data'
      )
    }
    const output = {
      entry: result.map(row => {
        const bpEntry = {};
        bpEntry.ID = row.PARTNERID;
        bpEntry.Name = row.COMPANYNAME + ' ' + row.LEGALFORM;
        bpEntry.Street = row.STREET;
        bpEntry.Building = row.BUILDING;
        bpEntry.Zip = row.POSTALCODE;
        bpEntry.City = row.CITY;
        bpEntry.Country = row.COUNTRY;
        bpEntry.Email = row.EMAILADDRESS;
        bpEntry.Phone = row.PHONENUMBER;
        bpEntry.Web = row.WEBADDRESS;
        bpEntry.Region = row.REGION;
        bpEntry.lat = row.LATITUDE;
        bpEntry.long = row.LONGITUDE;
        return bpEntry;
      })
    };
    return output;
  }
  catch (e) {
    return req.error(
      500,
      `Getting All BP Transaction Data Failed: ${ e.message }`
    )
  }
}

module.exports = { getAllBusinessPartnersData };
