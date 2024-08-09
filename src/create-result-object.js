const { getLogger } = require('./logger');
/**
 *
 * @param entities
 * @param apiResponse
 * @returns {*[]}
 */
const createResultObject = (entities, apiResponse, options) => {
  const lookupResults = [];
  entities.forEach((entity) => {
    const match = apiResponse.data.find(
      (result) => result.domain === entity.value.toLowerCase()
    );
    if (match) {
      lookupResults.push({
        entity,
        data: {
          summary: createSummary(match, options),
          details: match
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

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (match, options) => {
  const tags = [];

  // If the option to only return active matches is true, we don't show the status tag
  // as it will always be "active"
  if (!options.activeOnly) {
    tags.push(`Status: ${match.status}`);
  }

  if (match.classification) {
    tags.push(`${match.classification}`);
  } else {
    tags.push(`Unclassified`);
  }

  return tags;
};

module.exports = {
  createResultObject
};
