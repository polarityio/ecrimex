module.exports = {
  name: 'ECrimeX',
  acronym: 'ECX',
  description:
    'Search the ECrimeX Malicious Domains and Phish repositories for information on malicious domains and phishing URLs',
  entityTypes: ['domain', 'url', 'IPv4'],
  customTypes: [
    {
      key: 'crypto',
      regex: /\b[a-zA-Z0-9]{32,64}\b/
    }
  ],
  styles: ['./styles/styles.less'],
  onDemandOnly: true,
  defaultColor: 'light-blue',
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: ''
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'apiKey',
      name: 'ECrimeX API Key',
      description:
        'API Key used to authenticate to ECrimeX.  The user account associated with the API Key must have access to the ECrimeX Malicious Domain and Phish datasets.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'activeOnly',
      name: 'Return Active Indicators Only',
      description:
        'If enabled, the integration will only return indicators with a status of "Active".',
      default: false,
      type: 'boolean',
      userCanEdit: false,
      adminOnly: true
    }
  ]
};
