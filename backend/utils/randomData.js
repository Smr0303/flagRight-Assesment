const { v4: uuidv4 } = require('uuid');

const generateRandomData = {

  randomArrayElement: (arr) => arr[Math.floor(Math.random() * arr.length)],

  randomNumber: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  randomBoolean: () => Math.random() < 0.5,

  randomAmount: () => parseFloat((Math.random() * 10000).toFixed(2)),

  countryCode: () => {
    const countries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'CN', 'IN', 'BR'];
    return generateRandomData.randomArrayElement(countries);
  },

  currencyCode: () => {
    const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
    return generateRandomData.randomArrayElement(currencies);
  },

  ipAddress: () => {
    return `${generateRandomData.randomNumber(1, 255)}.${generateRandomData.randomNumber(1, 255)}.${generateRandomData.randomNumber(1, 255)}.${generateRandomData.randomNumber(1, 255)}`;
  },

  email: () => {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const usernames = ['john', 'jane', 'user', 'account', 'customer'];
    return `${generateRandomData.randomArrayElement(usernames)}${generateRandomData.randomNumber(1, 999)}@${generateRandomData.randomArrayElement(domains)}`;
  },

  sentence: () => {
    const words = ['transaction', 'payment', 'transfer', 'purchase', 'deposit', 'withdrawal', 'for', 'invoice', 'bill'];
    const length = generateRandomData.randomNumber(3, 7);
    return Array.from({ length }, () => generateRandomData.randomArrayElement(words)).join(' ');
  }
};

const generateRandomTransaction = () => {

  const obj = {
    p_transactionid: uuidv4(),
    p_type: generateRandomData.randomArrayElement(['Deposit', 'Withdrawals', 'Transfers', 'Payments']),
    p_timestamp: Date.now(),
    p_originuserid: `user_${generateRandomData.randomNumber(1000, 9999)}`, // String
    p_destinationuserid: `user_${generateRandomData.randomNumber(1000, 9999)}`, // String
    
    p_originamountdetails: {
      transactionAmount: generateRandomData.randomAmount(),
      transactionCurrency: generateRandomData.currencyCode(),
      country: generateRandomData.countryCode()
    },
    
    p_destinationamountdetails: {
      transactionAmount: generateRandomData.randomAmount(),
      transactionCurrency: generateRandomData.currencyCode(),
      country: generateRandomData.countryCode()
    },
    
    p_promotioncodeused: generateRandomData.randomBoolean(),
    p_reference: generateRandomData.sentence(),
    
    p_origindevicedata: {
      batteryLevel: generateRandomData.randomNumber(0, 100),
      deviceLatitude: (Math.random() * 180 - 90).toFixed(6),
      deviceLongitude: (Math.random() * 360 - 180).toFixed(6),
      ipAddress: generateRandomData.ipAddress(),
      deviceIdentifier: uuidv4(),
      vpnUsed: generateRandomData.randomBoolean(),
      operatingSystem: generateRandomData.randomArrayElement(['Android', 'iOS', 'Windows', 'Linux']),
      deviceMaker: generateRandomData.randomArrayElement(['Apple', 'Samsung', 'Google', 'Huawei', 'Dell']),
      deviceModel: generateRandomData.randomArrayElement(['ProModel', 'EliteBook', 'Galaxy', 'Pixel']),
      deviceYear: generateRandomData.randomNumber(2015, 2023),
      appVersion: `${generateRandomData.randomNumber(1, 5)}.${generateRandomData.randomNumber(0, 9)}.${generateRandomData.randomNumber(0, 9)}`
    },
    
    p_destinationdevicedata: {
      batteryLevel: generateRandomData.randomNumber(0, 100),
      deviceLatitude: (Math.random() * 180 - 90).toFixed(6),
      deviceLongitude: (Math.random() * 360 - 180).toFixed(6),
      ipAddress: generateRandomData.ipAddress(),
      deviceIdentifier: uuidv4(),
      vpnUsed: generateRandomData.randomBoolean(),
      operatingSystem: generateRandomData.randomArrayElement(['Android', 'iOS', 'Windows', 'Linux']),
      deviceMaker: generateRandomData.randomArrayElement(['Apple', 'Samsung', 'Google', 'Huawei', 'Dell']),
      deviceModel: generateRandomData.randomArrayElement(['ProModel', 'EliteBook', 'Galaxy', 'Pixel']),
      deviceYear: generateRandomData.randomNumber(2015, 2023),
      appVersion: `${generateRandomData.randomNumber(1, 5)}.${generateRandomData.randomNumber(0, 9)}.${generateRandomData.randomNumber(0, 9)}`
    },
    
    p_tags: [{ 
      key: generateRandomData.randomArrayElement(['category', 'source', 'type']), 
      value: generateRandomData.randomArrayElement(['online', 'mobile', 'transfer']) 
    }],
    
    p_description: generateRandomData.sentence(),
    p_originemail: generateRandomData.email(),
    p_destinationemail: generateRandomData.email()
  };

  console.log('Transaction object generated');

  return obj;

};

module.exports = generateRandomTransaction;