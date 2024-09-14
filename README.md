# Polarity ECrimeX Integration

The Polarity ECrimeX integration searches the Anti-Phishing Working Group's (APWG) ECrimeX malicious domain, malicious IP, and phish URL dataset.

Domains are looked up against the malicious domain dataset, URLs are looked up against the Phish dataset, and IPv4 addresses are looked up against the Malicious IP dataset.

To learn more about ECrimeX, visit the [official website](https://apwg.org/ecx/).

## Integration Options

### ECrimeX API Key

API Key used to authenticate to ECrimeX.  The user account associated with the API Key must have access to the ECrimeX Malicious Domain and Phish dataset.

### Return Active Indicators Only
If enabled, the integration will only return indicators with a status of "Active".

## Installation Instructions

Installation instructions for integrations are provided on the [PolarityIO GitHub Page](https://polarityio.github.io/).

## Polarity

Polarity is a memory-augmentation platform that improves and accelerates analyst decision making. For more information about the Polarity platform please see:

https://polarity.io/
