'use strict';

const resetTable = require('./resetTableHandler').resetTable;

/**
 * Module for resetting tables.
 * @module resetTables
 * @see module:./resetTableHandler.resetTable
 */

async function resetSOHeader(req) {
  return await resetTable('SO_HEADER', 'SHADOW_SOSHADOW_HEADER', req);
}

async function resetSOItem(req) {
  return await resetTable('SO_ITEM', 'SHADOW_SOSHADOW_ITEM', req);
}

async function resetPOHeader(req) {
  return await resetTable('PO_HEADER', 'SHADOW_POSHADOW_HEADER', req);
}

async function resetPOItem(req) {
  return await resetTable('PO_ITEM', 'SHADOW_POSHADOW_ITEM', req);
}

async function resetAddresses(req) {
  return await resetTable('MD_ADDRESSES', 'SHADOW_MDSHADOW_ADDRESSES', req);
}

async function resetEmployees(req) {
  return await resetTable('MD_EMPLOYEES', 'SHADOW_MDSHADOW_EMPLOYEES', req);
}

async function resetPartners(req) {
  return await resetTable('MD_BUSINESSPARTNER', 'SHADOW_MDSHADOW_BUSINESSPARTNER', req);
}

async function resetProducts(req) {
  return await resetTable('MD_PRODUCTS', 'SHADOW_MDSHADOW_PRODUCTS', req);
}

async function resetConstants(req) {
  return await resetTable('UTIL_CONSTANTS', 'SHADOW_UTILSHADOW_CONSTANTS', req);
}

async function resetTexts(req) {
  return await resetTable('UTIL_TEXTS', 'SHADOW_UTILSHADOW_TEXTS', req);
}

async function resetNotes(req) {
  return await resetTable('UTIL_NOTES', 'SHADOW_UTILSHADOW_NOTES', req);
}

async function resetAttachments(req) {
  return await resetTable('UTIL_ATTACHMENTS', 'SHADOW_UTILSHADOW_ATTACHMENTS', req);
}

module.exports = {
  resetSOHeader,
  resetSOItem,
  resetPOHeader,
  resetPOItem,
  resetAddresses,
  resetEmployees,
  resetPartners,
  resetProducts,
  resetConstants,
  resetTexts,
  resetNotes,
  resetAttachments
};
