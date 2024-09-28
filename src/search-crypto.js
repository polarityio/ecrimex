/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const SUCCESS_CODES = [200];

async function searchCrypto(entities, options) {
  const Logger = getLogger();

  const requestOptions = createRequestOptions(entities, options);

  Logger.trace({ requestOptions }, 'Request Options');

  const apiResponse = await polarityRequest.request(requestOptions);

  Logger.trace({ apiResponse }, 'Lookup API Response');

  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to the ECrimeX API`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions: apiResponse.requestOptions,
        requestBody: apiResponse.body
      }
    );
  }

  return apiResponse.body;
}

function createRequestOptions(entities, options) {
  let requestOptions = {
    uri: `https://ecrimex.net/api/v1/cryptocurrency-addresses/search`,
    method: 'POST',
    body: {
      filters: {
        // Lookups into ECrimeX are case-sensitive and exact match only
        address: entities.map((entity) => entity.value)
      },
      sorts: ['createdAt']
    },
    headers: {
      Authorization: `${options.apiKey}`
    },
    json: true
  };

  if (options.activeOnly) {
    requestOptions.body.filters.status = 'active';
  }

  return requestOptions;
}

module.exports = {
  searchCrypto
};
