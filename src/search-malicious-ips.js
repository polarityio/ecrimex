/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const async = require('async');

const SUCCESS_CODES = [200];
const MAX_TASKS_AT_A_TIME = 10;

async function searchMaliciousIps(entities, options) {
  const Logger = getLogger();
  let results = {
    data: []
  };

  const tasks = entities.map((entity) => {
    return async () => {
      const requestOptions = createRequestOptions(entity, options);

      Logger.trace({ requestOptions }, 'Request Options');

      const apiResponse = await polarityRequest.request(requestOptions);

      Logger.trace({ apiResponse }, 'Malicious IP Lookup API Response');

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
      results.data = results.data.concat(apiResponse.body.data);
    };
  });

  await async.parallelLimit(tasks, MAX_TASKS_AT_A_TIME);

  return results;
}

/**
 * Note that malicious IP lookups do not support bulk looks and must be done one at a time
 * @param entity
 * @param options
 * @returns {{headers: {Authorization: string}, method: string, json: boolean, body: {filters: {ip}, sorts: string[]}, uri: string}}
 */
function createRequestOptions(entity, options) {
  let requestOptions = {
    uri: `https://ecrimex.net/api/v1/malicious-ip/search`,
    method: 'POST',
    body: {
      filters: {
        ip: entity.value
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
  searchMaliciousIps
};
