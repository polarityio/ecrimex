/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const SUCCESS_CODES = [200];

async function searchPhish(entities, options) {
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
        requestOptions: apiResponse.requestOptions
      }
    );
  }

  return apiResponse.body;
}

function createRequestOptions(entities, options) {
  let requestOptions = {
    uri: `https://ecrimex.net/api/v1/phish/search`,
    method: 'POST',
    body: {
      filters: {
        // Lookups into ECrimeX are case-sensitive and exact match only
        // Many of the URLs in ECrimeX have a trailing slash.  When looking up a URL if you don't
        // include the trailing slash (or don't remove the trailing slash), you won't get a result for a URL
        // that is otherwise a match.  Due to this, we always lookup the URL both with and without a trailing slash.
        url: entities.reduce((accum, entity) => {
          accum.push(entity.value.toLowerCase());
          if (entity.value.endsWith('/')) {
            accum.push(entity.value.slice(0, -1));
          } else {
            accum.push(entity.value + '/');
          }
          return accum;
        }, [])
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
  searchPhish
};
