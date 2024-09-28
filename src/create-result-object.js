const { getLogger } = require('./logger');
const {
  SOURCE_MALICIOUS_DOMAIN,
  SOURCE_PHISH,
  SOURCE_MALICIOUS_IP,
  SOURCE_CRYPTOCURRENCY_ADDRESSES
} = require('./sources');

const titles = {
  [SOURCE_PHISH]: 'Phish Information',
  [SOURCE_MALICIOUS_IP]: 'Malicious IP Information',
  [SOURCE_MALICIOUS_DOMAIN]: 'Malicious Domain Information',
  [SOURCE_CRYPTOCURRENCY_ADDRESSES]: 'Cryptocurrency Addresses'
};

const MAX_TAGS = 4;
/**
 *
 * @param entities
 * @param apiResponse
 * @returns {*[]}
 */
const createResultObjects = (entities, apiResponse, source, options) => {
  const lookupResults = [];
  entities.forEach((entity) => {
    const matches = apiResponse.data.filter((result) =>
      isEntityMatch(entity, result, source)
    );
    if (matches.length > 0) {
      lookupResults.push({
        entity,
        data: {
          summary: createSummary(matches, source, options),
          details: {
            title: titles[source],
            source,
            data: matches
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
  if (source === SOURCE_MALICIOUS_IP) {
    return result.ip === entity.value;
  }
  if (source === SOURCE_CRYPTOCURRENCY_ADDRESSES) {
    return result.address === entity.value;
  }
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (matches, source, options) => {
  const tagSet = new Set();
  let counts = {
    'Malicious IP': 0,
    'Malicious Domain': 0,
    'Phish URL': 0,
    'Crypto': 0
  };

  matches.forEach((match) => {
    if (source === SOURCE_MALICIOUS_DOMAIN) {
      if (match.classification) {
        tagSet.add(`Malicious Domain: ${match.classification}`);
      } else {
        tagSet.add(`Malicious Domain: Unclassified`);
      }
      counts['Malicious Domain']++;
    } else if (source === SOURCE_PHISH) {
      if (match.brand) {
        tagSet.add(`Phish URL: ${match.brand}`);
      } else {
        tagSet.add(`Phish URL: No brand`);
      }
      counts['Phish URL']++;
    } else if (source === SOURCE_MALICIOUS_IP) {
      if (match.brand) {
        tagSet.add(`Malicious IP: ${match.brand}`);
      } else {
        tagSet.add(`Malicious IP: No brand`);
      }
      counts['Malicious IP']++;
    } else if (source === SOURCE_CRYPTOCURRENCY_ADDRESSES) {
      if (match.currency) {
        tagSet.add(`Crypto: ${match.currency}`);
      } else {
        tagSet.add(`Crypto: No Currency`);
      }
      counts['Crypto']++;
    }

    // If the option to only return active matches is true, we don't show the status tag
    // as it will always be "active"
    if (!options.activeOnly && match.status !== null) {
      tagSet.add(`Status: ${match.status}`);
    }
  });

  if (tagSet.size > MAX_TAGS) {
    let tags = [];
    for (let key in counts) {
      if (counts[key] > 0) {
        tags.push(`${key}: ${counts[key]} results`);
      }
    }
    return tags;
  } else {
    return [...tagSet];
  }
};

module.exports = {
  createResultObjects
};
