export type Airport = { lat: number; lng: number }

/** Major world airports keyed by IATA code */
export const AIRPORTS: Record<string, Airport> = {
  // ── North America ─────────────────────────────────────────────────────────
  ATL: { lat: 33.6367, lng: -84.4281 },   // Atlanta
  LAX: { lat: 33.9425, lng: -118.4081 },  // Los Angeles
  ORD: { lat: 41.9742, lng: -87.9073 },   // Chicago O'Hare
  DFW: { lat: 32.8998, lng: -97.0403 },   // Dallas
  DEN: { lat: 39.8561, lng: -104.6737 },  // Denver
  JFK: { lat: 40.6413, lng: -73.7781 },   // New York JFK
  SFO: { lat: 37.6213, lng: -122.3790 },  // San Francisco
  SEA: { lat: 47.4502, lng: -122.3088 },  // Seattle
  LAS: { lat: 36.0840, lng: -115.1537 },  // Las Vegas
  MIA: { lat: 25.7959, lng: -80.2870 },   // Miami
  BOS: { lat: 42.3656, lng: -71.0096 },   // Boston
  EWR: { lat: 40.6895, lng: -74.1745 },   // Newark
  PHX: { lat: 33.4373, lng: -112.0078 },  // Phoenix
  IAH: { lat: 29.9902, lng: -95.3368 },   // Houston
  MSP: { lat: 44.8848, lng: -93.2223 },   // Minneapolis
  DTW: { lat: 42.2162, lng: -83.3554 },   // Detroit
  PHL: { lat: 39.8744, lng: -75.2424 },   // Philadelphia
  CLT: { lat: 35.2140, lng: -80.9431 },   // Charlotte
  SLC: { lat: 40.7884, lng: -111.9778 },  // Salt Lake City
  MCO: { lat: 28.4293, lng: -81.3089 },   // Orlando
  YYZ: { lat: 43.6772, lng: -79.6306 },   // Toronto
  YVR: { lat: 49.1939, lng: -123.1844 },  // Vancouver
  YUL: { lat: 45.4706, lng: -73.7408 },   // Montreal
  MEX: { lat: 19.4363, lng: -99.0721 },   // Mexico City
  CUN: { lat: 21.0365, lng: -86.8771 },   // Cancún
  PTY: { lat: 9.0717,  lng: -79.3835 },   // Panama City

  // ── Europe ────────────────────────────────────────────────────────────────
  LHR: { lat: 51.4775, lng: -0.4614 },    // London Heathrow
  CDG: { lat: 49.0097, lng:  2.5479 },    // Paris CDG
  AMS: { lat: 52.3105, lng:  4.7683 },    // Amsterdam
  FRA: { lat: 50.0379, lng:  8.5622 },    // Frankfurt
  MAD: { lat: 40.4719, lng: -3.5626 },    // Madrid
  BCN: { lat: 41.2971, lng:  2.0785 },    // Barcelona
  MUC: { lat: 48.3537, lng: 11.7750 },    // Munich
  FCO: { lat: 41.7999, lng: 12.2462 },    // Rome
  ZRH: { lat: 47.4647, lng:  8.5492 },    // Zurich
  VIE: { lat: 48.1102, lng: 16.5697 },    // Vienna
  CPH: { lat: 55.6180, lng: 12.6561 },    // Copenhagen
  OSL: { lat: 60.1939, lng: 11.1004 },    // Oslo
  ARN: { lat: 59.6519, lng: 17.9186 },    // Stockholm
  HEL: { lat: 60.3172, lng: 24.9633 },    // Helsinki
  BRU: { lat: 50.9014, lng:  4.4844 },    // Brussels
  LIS: { lat: 38.7756, lng: -9.1354 },    // Lisbon
  ATH: { lat: 37.9364, lng: 23.9445 },    // Athens
  DUB: { lat: 53.4213, lng: -6.2701 },    // Dublin
  IST: { lat: 40.9769, lng: 28.8146 },    // Istanbul
  SVO: { lat: 55.9726, lng: 37.4146 },    // Moscow
  WAW: { lat: 52.1657, lng: 20.9671 },    // Warsaw
  BER: { lat: 52.3667, lng: 13.5033 },    // Berlin
  MAN: { lat: 53.3537, lng: -2.2750 },    // Manchester
  MXP: { lat: 45.6306, lng:  8.7281 },    // Milan

  // ── Middle East ───────────────────────────────────────────────────────────
  DXB: { lat: 25.2532, lng: 55.3657 },    // Dubai
  DOH: { lat: 25.2731, lng: 51.6079 },    // Doha
  AUH: { lat: 24.4330, lng: 54.6511 },    // Abu Dhabi
  RUH: { lat: 24.9576, lng: 46.6988 },    // Riyadh
  KWI: { lat: 29.2266, lng: 47.9689 },    // Kuwait
  CAI: { lat: 30.1219, lng: 31.4056 },    // Cairo
  TLV: { lat: 31.9965, lng: 34.8877 },    // Tel Aviv
  AMM: { lat: 31.7226, lng: 35.9932 },    // Amman

  // ── East Asia ─────────────────────────────────────────────────────────────
  HND: { lat: 35.5494, lng: 139.7798 },   // Tokyo Haneda
  NRT: { lat: 35.7720, lng: 140.3929 },   // Tokyo Narita
  PEK: { lat: 40.0799, lng: 116.6031 },   // Beijing
  PVG: { lat: 31.1443, lng: 121.8083 },   // Shanghai
  HKG: { lat: 22.3080, lng: 113.9185 },   // Hong Kong
  ICN: { lat: 37.4602, lng: 126.4407 },   // Seoul
  TPE: { lat: 25.0777, lng: 121.2329 },   // Taipei

  // ── Southeast Asia ────────────────────────────────────────────────────────
  SIN: { lat:  1.3644, lng: 103.9915 },   // Singapore
  KUL: { lat:  2.7456, lng: 101.7099 },   // Kuala Lumpur
  BKK: { lat: 13.6811, lng: 100.7472 },   // Bangkok
  CGK: { lat: -6.1256, lng: 106.6559 },   // Jakarta
  MNL: { lat: 14.5086, lng: 121.0194 },   // Manila
  SGN: { lat: 10.8188, lng: 106.6520 },   // Ho Chi Minh City
  HAN: { lat: 21.2187, lng: 105.8047 },   // Hanoi

  // ── South Asia ────────────────────────────────────────────────────────────
  DEL: { lat: 28.5562, lng:  77.1000 },   // New Delhi
  BOM: { lat: 19.0896, lng:  72.8656 },   // Mumbai
  MAA: { lat: 12.9941, lng:  80.1709 },   // Chennai
  BLR: { lat: 13.1986, lng:  77.7066 },   // Bengaluru
  CCU: { lat: 22.6547, lng:  88.4467 },   // Kolkata
  CMB: { lat:  7.1808, lng:  79.8841 },   // Colombo
  DAC: { lat: 23.8433, lng:  90.3978 },   // Dhaka
  KTM: { lat: 27.6966, lng:  85.3591 },   // Kathmandu

  // ── Africa ────────────────────────────────────────────────────────────────
  JNB: { lat: -26.1392, lng:  28.2460 },  // Johannesburg
  CPT: { lat: -33.9648, lng:  18.5978 },  // Cape Town
  NBO: { lat:  -1.3192, lng:  36.9275 },  // Nairobi
  LOS: { lat:   6.5774, lng:   3.3216 },  // Lagos
  ACC: { lat:   5.6052, lng:  -0.1668 },  // Accra
  ADD: { lat:   8.9779, lng:  38.7993 },  // Addis Ababa
  CMN: { lat:  33.3675, lng:  -7.5899 },  // Casablanca

  // ── South America ─────────────────────────────────────────────────────────
  GRU: { lat: -23.4356, lng: -46.4731 },  // São Paulo
  GIG: { lat: -22.8099, lng: -43.2505 },  // Rio de Janeiro
  EZE: { lat: -34.8222, lng: -58.5358 },  // Buenos Aires
  BOG: { lat:   4.7016, lng: -74.1469 },  // Bogotá
  LIM: { lat: -12.0219, lng: -77.1143 },  // Lima
  SCL: { lat: -33.3930, lng: -70.7858 },  // Santiago

  // ── Oceania ───────────────────────────────────────────────────────────────
  SYD: { lat: -33.9399, lng: 151.1753 },  // Sydney
  MEL: { lat: -37.6733, lng: 144.8430 },  // Melbourne
  BNE: { lat: -27.3842, lng: 153.1175 },  // Brisbane
  PER: { lat: -31.9403, lng: 115.9672 },  // Perth
  AKL: { lat: -37.0082, lng: 174.7850 },  // Auckland
}

/**
 * Major world passenger routes as [origin, destination] IATA pairs.
 * Covers US domestic, transatlantic, transpacific, intra-Europe,
 * Middle East hubs, Asia Pacific, Africa, and South America.
 */
export const ROUTES: [string, string][] = [
  // ── US Domestic ────────────────────────────────────────────────────────────
  ['ATL', 'LAX'], ['ATL', 'ORD'], ['ATL', 'DFW'], ['ATL', 'JFK'], ['ATL', 'MIA'],
  ['ATL', 'BOS'], ['ATL', 'IAH'], ['ATL', 'DEN'], ['ATL', 'SFO'], ['ATL', 'SEA'],
  ['LAX', 'JFK'], ['LAX', 'ORD'], ['LAX', 'DFW'], ['LAX', 'SFO'], ['LAX', 'SEA'],
  ['LAX', 'DEN'], ['LAX', 'MIA'], ['LAX', 'BOS'], ['LAX', 'LAS'], ['LAX', 'PHX'],
  ['ORD', 'JFK'], ['ORD', 'DFW'], ['ORD', 'DEN'], ['ORD', 'SFO'], ['ORD', 'MIA'],
  ['ORD', 'SEA'], ['ORD', 'MSP'], ['ORD', 'DTW'],
  ['DFW', 'JFK'], ['DFW', 'DEN'], ['DFW', 'SEA'], ['DFW', 'MIA'], ['DFW', 'IAH'],
  ['JFK', 'BOS'], ['JFK', 'MIA'], ['JFK', 'SEA'], ['JFK', 'MCO'], ['JFK', 'CLT'],
  ['SFO', 'SEA'], ['SFO', 'DEN'], ['SFO', 'PHX'], ['DEN', 'SEA'], ['DEN', 'SLC'],
  ['MIA', 'BOS'], ['CLT', 'LAX'], ['YYZ', 'YVR'], ['YYZ', 'YUL'],
  // ── Transatlantic ──────────────────────────────────────────────────────────
  ['JFK', 'LHR'], ['JFK', 'CDG'], ['JFK', 'AMS'], ['JFK', 'FRA'], ['JFK', 'MAD'],
  ['JFK', 'FCO'], ['JFK', 'ZRH'], ['JFK', 'IST'], ['JFK', 'DXB'],
  ['EWR', 'LHR'], ['EWR', 'FRA'], ['EWR', 'AMS'],
  ['BOS', 'LHR'], ['BOS', 'FRA'], ['BOS', 'DUB'],
  ['MIA', 'LHR'], ['MIA', 'MAD'],
  ['LAX', 'LHR'], ['LAX', 'CDG'], ['LAX', 'FRA'], ['LAX', 'AMS'],
  ['ORD', 'LHR'], ['ORD', 'FRA'],
  ['ATL', 'LHR'], ['ATL', 'CDG'],
  ['SFO', 'LHR'], ['SFO', 'CDG'],
  ['YYZ', 'LHR'], ['YYZ', 'CDG'], ['YUL', 'CDG'], ['YVR', 'LHR'],
  // ── Transpacific ───────────────────────────────────────────────────────────
  ['LAX', 'NRT'], ['LAX', 'HKG'], ['LAX', 'ICN'], ['LAX', 'PEK'], ['LAX', 'PVG'],
  ['LAX', 'SIN'], ['LAX', 'SYD'], ['LAX', 'AKL'],
  ['SFO', 'NRT'], ['SFO', 'HKG'], ['SFO', 'ICN'], ['SFO', 'SYD'],
  ['JFK', 'NRT'], ['JFK', 'HKG'], ['JFK', 'PEK'],
  ['ORD', 'NRT'], ['ORD', 'PEK'],
  ['SEA', 'NRT'], ['SEA', 'ICN'],
  ['YVR', 'NRT'], ['YVR', 'HKG'],
  // ── Intra-Europe ───────────────────────────────────────────────────────────
  ['LHR', 'CDG'], ['LHR', 'AMS'], ['LHR', 'FRA'], ['LHR', 'MAD'], ['LHR', 'BCN'],
  ['LHR', 'FCO'], ['LHR', 'MUC'], ['LHR', 'ZRH'], ['LHR', 'DUB'], ['LHR', 'IST'],
  ['LHR', 'VIE'], ['LHR', 'CPH'], ['LHR', 'OSL'], ['LHR', 'ARN'], ['LHR', 'MAN'],
  ['LHR', 'ATH'], ['LHR', 'LIS'],
  ['CDG', 'AMS'], ['CDG', 'FRA'], ['CDG', 'MAD'], ['CDG', 'BCN'], ['CDG', 'FCO'],
  ['CDG', 'IST'], ['CDG', 'ZRH'], ['CDG', 'LIS'], ['CDG', 'ATH'],
  ['FRA', 'AMS'], ['FRA', 'MAD'], ['FRA', 'FCO'], ['FRA', 'VIE'], ['FRA', 'IST'],
  ['FRA', 'MUC'], ['FRA', 'WAW'], ['FRA', 'BER'], ['FRA', 'CPH'],
  ['AMS', 'CPH'], ['AMS', 'OSL'], ['AMS', 'IST'], ['AMS', 'ATH'],
  ['MAD', 'BCN'], ['MAD', 'LIS'], ['MAD', 'ATH'], ['IST', 'ATH'],
  // ── Middle East hub spokes ─────────────────────────────────────────────────
  ['DXB', 'LHR'], ['DXB', 'JFK'], ['DXB', 'LAX'], ['DXB', 'CDG'], ['DXB', 'FRA'],
  ['DXB', 'AMS'], ['DXB', 'MAD'], ['DXB', 'MUC'], ['DXB', 'IST'],
  ['DXB', 'SIN'], ['DXB', 'KUL'], ['DXB', 'BKK'], ['DXB', 'NRT'], ['DXB', 'ICN'],
  ['DXB', 'SYD'], ['DXB', 'MEL'], ['DXB', 'PER'],
  ['DXB', 'DEL'], ['DXB', 'BOM'], ['DXB', 'CMB'], ['DXB', 'DAC'], ['DXB', 'KTM'],
  ['DXB', 'JNB'], ['DXB', 'NBO'], ['DXB', 'ADD'], ['DXB', 'LOS'],
  ['DXB', 'CAI'], ['DXB', 'RUH'], ['DXB', 'KWI'], ['DXB', 'TLV'], ['DXB', 'AMM'],
  ['DOH', 'LHR'], ['DOH', 'JFK'], ['DOH', 'DXB'], ['DOH', 'SIN'], ['DOH', 'SYD'],
  ['AUH', 'LHR'], ['AUH', 'JFK'], ['AUH', 'SYD'],
  // ── Asia Pacific ───────────────────────────────────────────────────────────
  ['SIN', 'LHR'], ['SIN', 'SYD'], ['SIN', 'AKL'], ['SIN', 'MEL'],
  ['SIN', 'HKG'], ['SIN', 'NRT'], ['SIN', 'ICN'], ['SIN', 'PEK'], ['SIN', 'PVG'],
  ['SIN', 'BKK'], ['SIN', 'KUL'], ['SIN', 'CGK'], ['SIN', 'MNL'], ['SIN', 'SGN'],
  ['SIN', 'DEL'], ['SIN', 'BOM'],
  ['HKG', 'NRT'], ['HKG', 'ICN'], ['HKG', 'PEK'], ['HKG', 'PVG'], ['HKG', 'TPE'],
  ['HKG', 'BKK'], ['HKG', 'SYD'], ['HKG', 'MEL'], ['HKG', 'LHR'],
  ['NRT', 'ICN'], ['NRT', 'PEK'], ['NRT', 'PVG'], ['NRT', 'BKK'], ['NRT', 'SYD'],
  ['PEK', 'FRA'], ['PEK', 'LHR'], ['ICN', 'FRA'], ['ICN', 'LHR'],
  ['BKK', 'DEL'], ['BKK', 'KUL'], ['BKK', 'SYD'],
  ['DEL', 'LHR'], ['DEL', 'CDG'], ['DEL', 'FRA'], ['DEL', 'SIN'],
  ['BOM', 'LHR'], ['BOM', 'DXB'], ['BOM', 'SIN'],
  // ── Africa ─────────────────────────────────────────────────────────────────
  ['JNB', 'LHR'], ['JNB', 'DXB'], ['JNB', 'AMS'], ['JNB', 'FRA'], ['JNB', 'CPT'],
  ['NBO', 'LHR'], ['NBO', 'DXB'], ['ADD', 'DXB'], ['ADD', 'LHR'],
  ['LOS', 'LHR'], ['LOS', 'DXB'], ['LOS', 'ACC'],
  ['CMN', 'CDG'], ['CMN', 'MAD'], ['CAI', 'DXB'], ['CAI', 'LHR'],
  // ── South America ──────────────────────────────────────────────────────────
  ['GRU', 'JFK'], ['GRU', 'MIA'], ['GRU', 'LHR'], ['GRU', 'MAD'], ['GRU', 'CDG'],
  ['GRU', 'FRA'], ['GRU', 'EZE'], ['GRU', 'BOG'], ['GRU', 'SCL'], ['GRU', 'GIG'],
  ['EZE', 'LHR'], ['EZE', 'MAD'], ['EZE', 'SCL'],
  ['BOG', 'JFK'], ['BOG', 'MIA'], ['BOG', 'LIM'], ['LIM', 'JFK'], ['LIM', 'MIA'],
  ['SCL', 'MIA'], ['MEX', 'JFK'], ['MEX', 'LAX'], ['MEX', 'MIA'], ['CUN', 'JFK'],
  // ── Oceania ────────────────────────────────────────────────────────────────
  ['SYD', 'LHR'], ['SYD', 'DXB'], ['SYD', 'SIN'], ['SYD', 'MEL'], ['SYD', 'BNE'],
  ['SYD', 'AKL'], ['MEL', 'LHR'], ['MEL', 'DXB'], ['MEL', 'SIN'],
  ['AKL', 'LHR'], ['AKL', 'LAX'], ['BNE', 'SIN'], ['PER', 'SIN'], ['PER', 'DXB'],
]
