const { getLogger } = require('./logger');
const { SOURCE_MALICIOUS_DOMAIN, SOURCE_PHISH } = require('./sources');
/**
 *
 * @param entities
 * @param apiResponse
 * @returns {*[]}
 */
const createResultObjects = (entities, apiResponse, source, options) => {
  const lookupResults = [];
  entities.forEach((entity) => {
    const match = apiResponse.data.find((result) =>
      isEntityMatch(entity, result, source)
    );
    if (match) {
      lookupResults.push({
        entity,
        data: {
          summary: createSummary(match, source, options),
          details: {
            source,
            ...match
          }
        }
      });
    } else {
      lookupResults.push({
        entity,
        data: null
      });
    }
  });

  return lookupResults;
};

const isEntityMatch = (entity, result, source) => {
  if (source === SOURCE_PHISH) {
    const entityWithTrailingSlash = entity.value.endsWith('/')
      ? entity.value
      : entity.value + '/';
    return (
      result.url === entityWithTrailingSlash ||
      result.url + '/' === entityWithTrailingSlash
    );
  }
  if (source === SOURCE_MALICIOUS_DOMAIN) {
    return result.domain === entity.value;
  }
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (match, source, options) => {
  const tags = [];

  if (source === SOURCE_MALICIOUS_DOMAIN) {
    if (match.classification) {
      tags.push(`Malicious Domain: ${match.classification}`);
    } else {
      tags.push(`Malicious Domain: Unclassified`);
    }
  } else if (source === SOURCE_PHISH) {
    if (match.brand) {
      tags.push(`Phish URL: ${match.brand}`);
    } else {
      tags.push(`Phish URL: No brand`);
    }
  }

  // If the option to only return active matches is true, we don't show the status tag
  // as it will always be "active"
  if (!options.activeOnly) {
    tags.push(`Status: ${match.status}`);
  }

  return tags;
};

module.exports = {
  createResultObjects
};
