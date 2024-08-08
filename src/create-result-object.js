const { getLogger } = require('./logger');
/**
 *
 * @param entities
 * @param apiResponse
 * @returns {*[]}
 */
const createResultObject = (entities, apiResponse) => {
  const lookupResults = [];
  entities.forEach((entity) => {
    const match = apiResponse.data.find(
      (result) => result.domain === entity.value.toLowerCase()
    );
    if (match) {
      lookupResults.push({
        entity,
        data: {
          summary: createSummary(match),
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
const createSummary = (match) => {
  const tags = [];

  tags.push(`Status: ${match.status}`);
  tags.push(`${match.classification}`);

  return tags;
};

module.exports = {
  createResultObject
};
