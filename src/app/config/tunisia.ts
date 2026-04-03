// Tunisia-specific configuration
export const Tunisia = {
  code: 'TN',
  name: 'Tunisia',
  currency: {
    code: 'TND',
    symbol: 'د.ت',
    name: 'Tunisian Dinar',
  },
  phonePrefix: '+216',
  regions: [
    'Ariana',
    'Ben Arous',
    'La Marsa',
    'Sfax',
    'Sousse',
    'Tunis',
    'Bizerte',
    'Kef',
    'Jendouba',
    'Kairouan',
    'Kasserine',
    'Tataouine',
    'Tozeur',
    'Kebili',
    'Sidi Bouzid',
    'Mahdia',
    'Nabeul',
    'Zaghouan',
    'Monastir',
    'Mdenine',
    'Gafsa',
  ],
  cities: [
    // Tunis Governorate
    { name: 'Tunis', region: 'Tunis', lat: 36.8065, lng: 10.1962 },
    { name: 'La Marsa', region: 'La Marsa', lat: 36.8599, lng: 10.3279 },
    { name: 'Carthage', region: 'Tunis', lat: 36.8523, lng: 10.3241 },
    { name: 'Ezzahra', region: 'Ben Arous', lat: 36.7667, lng: 10.2167 },
    { name: 'Ariana', region: 'Ariana', lat: 36.8704, lng: 10.1593 },
    
    // Sfax
    { name: 'Sfax', region: 'Sfax', lat: 34.7406, lng: 10.7603 },
    { name: 'Skhira', region: 'Sfax', lat: 34.9108, lng: 11.0742 },
    
    // Sousse
    { name: 'Sousse', region: 'Sousse', lat: 35.8245, lng: 10.6361 },
    { name: 'Hammam-Sousse', region: 'Sousse', lat: 35.8167, lng: 10.6167 },
    { name: 'Monastir', region: 'Monastir', lat: 35.7683, lng: 10.8138 },
    
    // Bizerte
    { name: 'Bizerte', region: 'Bizerte', lat: 37.2755, lng: 9.8744 },
    { name: 'Menzel Bourguiba', region: 'Bizerte', lat: 37.4419, lng: 9.7333 },
    
    // Kairouan
    { name: 'Kairouan', region: 'Kairouan', lat: 35.6714, lng: 10.1019 },
    
    // Nabeul
    { name: 'Nabeul', region: 'Nabeul', lat: 36.4556, lng: 10.7367 },
    { name: 'Hammamet', region: 'Nabeul', lat: 36.3969, lng: 10.6146 },
    
    // Jendouba
    { name: 'Jendouba', region: 'Jendouba', lat: 36.5029, lng: 8.7755 },
    
    // Kef
    { name: 'Kef', region: 'Kef', lat: 36.1833, lng: 8.7167 },
    
    // Kasserine
    { name: 'Kasserine', region: 'Kasserine', lat: 35.1667, lng: 8.8333 },
    
    // Sidi Bouzid
    { name: 'Sidi Bouzid', region: 'Sidi Bouzid', lat: 35.6403, lng: 9.4906 },
    
    // Gafsa
    { name: 'Gafsa', region: 'Gafsa', lat: 34.4258, lng: 8.7861 },
    
    // Tozeur
    { name: 'Tozeur', region: 'Tozeur', lat: 33.9197, lng: 8.1347 },
    
    // Tataouine
    { name: 'Tataouine', region: 'Tataouine', lat: 33.3641, lng: 10.4285 },
    { name: 'Djerba', region: 'Medenine', lat: 33.8081, lng: 10.3667 },
    
    // Mahdia
    { name: 'Mahdia', region: 'Mahdia', lat: 35.5047, lng: 11.0623 },
    
    // Mdenine
    { name: 'Medenine', region: 'Mdenine', lat: 33.3607, lng: 10.3540 },
    
    // Zaghouan
    { name: 'Zaghouan', region: 'Zaghouan', lat: 36.4047, lng: 10.1433 },
  ],
  priceRanges: {
    min: 300,
    max: 2000,
    currency: 'TND',
  },
};
