'use strict';

const { setLogger } = require('./src/logger');
const { parseErrorToReadableJSON, ApiRequestError } = require('./src/errors');
const polarityRequest = require('./src/polarity-request');
const { createResultObject } = require('./src/create-result-object');
const chunk = require('lodash.chunk');
const async = require('async');

const SUCCESS_CODES = [200];
const MAX_ENTITY_CHUNKS_TO_LOOKUP_AT_ONCE = 2;
const MAX_ENTITIES_PER_CHUNK = 10;

let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

const doLookup = async (entities, options, cb) => {
  let lookupResults = [];

  Logger.trace({ entities }, 'doLookup');

  const entityChunks = chunk(entities, MAX_ENTITIES_PER_CHUNK);

  try {
    await async.eachLimit(
      entityChunks,
      MAX_ENTITY_CHUNKS_TO_LOOKUP_AT_ONCE,
      async (entityChunk) => {
        const requestOptions = createRequestOptions(entityChunk, options);

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

        lookupResults = lookupResults.concat(
          createResultObject(entities, apiResponse.body, options)
        );
      }
    );
  } catch (error) {
    const errorAsPojo = parseErrorToReadableJSON(error);
    Logger.error({ error: errorAsPojo }, 'Error in doLookup');
    return cb(errorAsPojo);
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

function createRequestOptions(entities, options) {
  let requestOptions = {
    uri: `https://ecrimex.net/api/v1/malicious-domain/search`,
    method: 'POST',
    body: {
      filters: {
        // Lookups into ECrimeX are case sensitive and exact match only
        domain: entities.map((entity) => entity.value.toLowerCase())
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

function validateOptions(userOptions, cb) {
  let errors = [];

  if (
    typeof userOptions.apiKey.value !== 'string' ||
    (typeof userOptions.apiKey.value === 'string' &&
      userOptions.apiKey.value.length === 0)
  ) {
    errors.push({
      key: 'apiKey',
      message: 'You must provide a valid ECrimeX API key'
    });
  }

  cb(null, errors);
}

module.exports = {
  startup,
  doLookup,
  validateOptions
};
