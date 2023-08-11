'use strict';
const xsenv = require('@sap/xsenv');

module.exports = {
  /**
   * Resolves environment variable bindings for job scheduler service
   * @method appconfig
   * @return {Object} job scheduler service credentials
   */
  appconfig: () => {
    const services = xsenv.getServices({ jobscheduler: { tag: 'jobscheduler' } }).jobscheduler;
    return {
      timeout: 15000,
      user: services.user,
      password: services.password,
      baseURL: services.url
    };
  },
  /**
   * Checks if a string contains only alphanumeric characters
   * @method isAlphaNumeric
   * @param {String} str - string to validate
   * @return {Boolean}
   */
  isAlphaNumeric: (str) => str.match(/^[a-z\d\-_]+$/i) !== null,
  /**
   * Checks if a string contains only alphanumeric characters and spaces
   * @method isAlphaNumericAndSpace
   * @param {String} str - string to validate
   * @return {Boolean}
   */
  isAlphaNumericAndSpace: (str) => str.match(/^[a-z\d\-_\s]+$/i) !== null,
  /**
   * Checks if a string is a valid date
   * @method isValidDate
   * @param {String} date - string to validate
   * @return {Boolean}
   */
  isValidDate: (date) => !isNaN(Date.parse(date))
};
