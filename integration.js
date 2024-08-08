'use strict';

const { setLogger } = require('./src/logger');
const { parseErrorToReadableJSON, ApiRequestError } = require('./src/errors');
const polarityRequest = require('./src/polarity-request');
const { createResultObject } = require('./src/create-result-object');

const SUCCESS_CODES = [200];

let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

/**
 * forEach entity
 *   MakeNetworkRequest1 -- Makes the network request, handles network errors only, returns raw network response
 *   HandleAPIErrors -- handles error handling of the API response
 *   CreateResultObject -- Handles any processing of the raw network response, creates a resultObject or resultMissObject
 *
 * @param entities
 * @param options
 * @param cb
 * @returns {Promise<void>}
 */
const doLookup = async (entities, options, cb) => {
  try {
    Logger.trace({ entities }, 'doLookup');

    // Make network request
    const apiResponse = await polarityRequest.request({
      uri: `https://ecrimex.net/api/v1/malicious-domain/search`,
      method: 'POST',
      body: {
        filters: {
          domain: entities.map((entity) => entity.value.toLowerCase())
        },
        sorts: ['createdAt']
      },
      headers: {
        'Authorization': `${options.apiKey}`
      },
      json: true
    });

    Logger.trace({ apiResponse }, 'Lookup API Response');

    // Handle API errors
    if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
      throw new ApiRequestError(
        `Unexpected status code ${apiResponse.statusCode} received when making request to the ECrimeX API`,
        {
          statusCode: apiResponse.statusCode,
          requestOptions: apiResponse.requestOptions
        }
      );
    }

    // Create the Result Object
    const lookupResults = createResultObject(entities, apiResponse.body);

    Logger.trace({ lookupResults }, 'Lookup Results');

    cb(null, lookupResults);
  } catch (error) {
    const errorAsPojo = parseErrorToReadableJSON(error);
    Logger.error({ error: errorAsPojo }, 'Error in doLookup');
    cb(errorAsPojo);
  }
};

module.exports = {
  startup,
  doLookup
};
