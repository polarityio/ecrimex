/**
 * "enums" used to designate which source was searched to get a specific result
 * @type {string}
 */
const SOURCE_MALICIOUS_DOMAIN = 'maliciousDomain';
const SOURCE_PHISH = 'phish';
const SOURCE_MALICIOUS_IP = 'maliciousIp';
const SOURCE_CRYPTOCURRENCY_ADDRESSES = 'crypto';

module.exports = {
    SOURCE_PHISH,
    SOURCE_MALICIOUS_DOMAIN,
    SOURCE_MALICIOUS_IP,
    SOURCE_CRYPTOCURRENCY_ADDRESSES
}