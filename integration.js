'use strict';

const chunk = require('lodash.chunk');
const async = require('async');

const { setLogger } = require('./src/logger');
const { parseErrorToReadableJSON, ApiRequestError } = require('./src/errors');
const { createResultObjects } = require('./src/create-result-object');
const { searchPhish } = require('./src/search-phish');
const { searchMaliciousDomains } = require('./src/search-malicious-domains');
const { SOURCE_MALICIOUS_DOMAIN, SOURCE_PHISH } = require('./src/sources');
const MAX_TASKS_AT_A_TIME = 2;
const MAX_ENTITIES_PER_CHUNK = 10;


let Logger = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

const doLookup = async (entities, options, cb) => {
  let lookupResults = [];


  const tasks = [];
  const entitiesByType = splitEntitiesByTypeAndChunk(entities);

  Logger.trace({ entitiesByType }, 'doLookup');

  entitiesByType.domain.forEach((entityChunk) => {
    tasks.push(async () => {
      const maliciousDomainResults = await searchMaliciousDomains(entityChunk, options);
      const domainResultObjects = createResultObjects(
        entityChunk,
        maliciousDomainResults,
        SOURCE_MALICIOUS_DOMAIN,
        options
      );
      lookupResults = lookupResults.concat(domainResultObjects);
    });
  });

  entitiesByType.url.forEach((entityChunk) => {
    tasks.push(async () => {
      const phishResults = await searchPhish(entityChunk, options);
      const urlResultObjects = createResultObjects(entityChunk, phishResults, SOURCE_PHISH, options);
      lookupResults = lookupResults.concat(urlResultObjects);
    });
  });

  try {
    await async.parallelLimit(tasks, MAX_TASKS_AT_A_TIME);
  } catch (error) {
    const errorAsPojo = parseErrorToReadableJSON(error);
    Logger.error({ error: errorAsPojo }, 'Error in doLookup');
    return cb(errorAsPojo);
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

/**
 * Takes an array of entities and splits the array up into a map of entities by entity type.
 * Each type is a 2d array as we want to chunk up the entities so we're never looking up
 * too many at one time.  For example, if the chunk size was 3, the output might look like this:
 *
 * {
 *     domain: [[d1,d2,d3],[d4,d5,d6]],
 *     url: [[url1, url2]]
 * }
 * @param entities
 * @returns {{domain: *[], url: *[]}}
 */
function splitEntitiesByTypeAndChunk(entities) {
  const entitiesByType = {
    domain: [],
    url: []
  };

  entities.forEach((entity) => {
    if (entity.isDomain) {
      entitiesByType.domain.push(entity);
    } else if (entity.isURL) {
      entitiesByType.url.push(entity);
    }
  });

  entitiesByType.domain = chunk(entitiesByType.domain, MAX_ENTITIES_PER_CHUNK);
  entitiesByType.url = chunk(entitiesByType.url, MAX_ENTITIES_PER_CHUNK);

  return entitiesByType;
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
