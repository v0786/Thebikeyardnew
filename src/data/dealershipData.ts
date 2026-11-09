import { Motorcycle, StockUnit, Customer, Booking, Sale, Payment, Refund, TestRide, Lead, StaffTask, Offer } from '../types';

export const DEALERSHIP_INFO = {
  name: 'The Bike Yard',
  tagline: 'Premium Motorcycles & Digital Showroom',
  address: 'Shop 4 & 5, Rutu Business Park, Near Cadbury Junction, Khopat, Thane West',
  city: 'Thane',
  state: 'Maharashtra',
  pincode: '400601',
  rtoCode: 'MH-04 (Thane Central)',
  phone: '+91 98204 55120',
  landline: '+91 22 2548 8900',
  email: 'sales@thebikeyard.in',
  gstin: '27AABCT9981K1ZT',
  bankDetails: {
    bankName: 'HDFC Bank Ltd, Khopat Branch',
    accountNumber: '50200084920194',
    ifsc: 'HDFC0001024',
    branch: 'Khopat, Thane (W)',
  },
  openingHours: 'Monday – Sunday: 10:00 AM – 8:30 PM',
};

export interface FinancePartner {
  id: string;
  name: string;
  logoShort: string;
  minInterestRate: number; // e.g. 8.99%
  maxFundingPct: number;    // e.g. 95%
  maxTenureMonths: number;  // e.g. 48 or 60
  processingFee: string;
  specialFeature: string;
}

export const FINANCE_PARTNERS: FinancePartner[] = [
  {
    id: 'bajaj-finance',
    name: 'Bajaj Finance Ltd',
    logoShort: 'BFL',
    minInterestRate: 8.99,
    maxFundingPct: 95,
    maxTenureMonths: 48,
    processingFee: '₹999 Flat Offer',
    specialFeature: 'Instant in-showroom sanction via Aadhaar OTP',
  },
  {
    id: 'hdfc-bank',
    name: 'HDFC Bank Two-Wheeler Loans',
    logoShort: 'HDFC',
    minInterestRate: 9.25,
    maxFundingPct: 90,
    maxTenureMonths: 60,
    processingFee: '1.25% of loan amount',
    specialFeature: 'Zero foreclosure charges after 6 EMIs for salaried customers',
  },
  {
    id: 'kotak-prime',
    name: 'Kotak Mahindra Prime',
    logoShort: 'KOTAK',
    minInterestRate: 9.50,
    maxFundingPct: 95,
    maxTenureMonths: 48,
    processingFee: '₹1,250 + GST',
    specialFeature: 'Special concession for existing 811 and Kotak account holders',
  },
  {
    id: 'tvs-credit',
    name: 'TVS Credit Services',
    logoShort: 'TVS',
    minInterestRate: 8.85,
    maxFundingPct: 95,
    maxTenureMonths: 48,
    processingFee: '₹899 Flat',
    specialFeature: 'Minimal documentation for first-time two-wheeler buyers',
  },
  {
    id: 'muthoot-capital',
    name: 'Muthoot Capital Services',
    logoShort: 'MUTHOOT',
    minInterestRate: 9.99,
    maxFundingPct: 85,
    maxTenureMonths: 36,
    processingFee: '1.5% of loan',
    specialFeature: 'Approval with income surrogate, no ITR required',
  },
  {
    id: 'idfc-first',
    name: 'IDFC FIRST Bank',
    logoShort: 'IDFC',
    minInterestRate: 9.15,
    maxFundingPct: 95,
    maxTenureMonths: 60,
    processingFee: 'Zero processing fee on CIBIL 750+',
    specialFeature: '100% paperless digital journey in 15 minutes',
  },
  {
    id: 'tata-capital',
    name: 'Tata Capital Two-Wheeler Finance',
    logoShort: 'TATA',
    minInterestRate: 9.40,
    maxFundingPct: 90,
    maxTenureMonths: 48,
    processingFee: '1.0% + GST',
    specialFeature: 'Step-up EMI option for early-career professionals',
  },
  {
    id: 'lt-finance',
    name: 'L&T Finance',
    logoShort: 'L&T',
    minInterestRate: 9.20,
    maxFundingPct: 90,
    maxTenureMonths: 48,
    processingFee: '₹1,100 Flat',
    specialFeature: 'Quick disbursement with doorstep KYC pickup in Thane',
  },
  {
    id: 'hero-fincorp',
    name: 'Hero FinCorp',
    logoShort: 'HERO',
    minInterestRate: 9.50,
    maxFundingPct: 85,
    maxTenureMonths: 36,
    processingFee: '1.2% + GST',
    specialFeature: 'Co-applicant flexibility and hassle-free NOC',
  },
  {
    id: 'indusind-bank',
    name: 'IndusInd Bank Two-Wheeler Loan',
    logoShort: 'INDUS',
    minInterestRate: 9.35,
    maxFundingPct: 90,
    maxTenureMonths: 48,
    processingFee: '₹1,200',
    specialFeature: 'Low down payment schemes starting from ₹12,999',
  },
];

export interface AccessoryItem {
  id: string;
  name: string;
  category: 'Safety' | 'Luggage' | 'Protection' | 'Apparel';
  pricePaise: bigint;
  image: string;
  description: string;
}

export const OFFICIAL_ACCESSORIES: AccessoryItem[] = [
  {
    id: 'acc-crash-guard',
    name: 'Heavy Duty Engine Crash Guard',
    category: 'Protection',
    pricePaise: 350000n, // ₹3,500
    image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
    description: 'Precision CNC tubular steel crash guard with matte powder coat finish.',
  },
  {
    id: 'acc-touring-windshield',
    name: 'Aerodynamic Touring Windshield',
    category: 'Protection',
    pricePaise: 210000n, // ₹2,100
    image: '/assets/images/bike_himalayan_450_1793818522395.jpg',
    description: 'High optical clarity polycarbonate shield to deflect high-speed highway windblast.',
  },
  {
    id: 'acc-tank-bag',
    name: 'Magnetic Quick-Release Tank Bag',
    category: 'Luggage',
    pricePaise: 180000n, // ₹1,800
    image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg',
    description: '14L expandable capacity with touch-screen phone navigation pouch and rain cover.',
  },
  {
    id: 'acc-helmet-isi',
    name: 'ECE & ISI Certified Full Face Helmet',
    category: 'Safety',
    pricePaise: 280000n, // ₹2,800
    image: '/assets/images/hero_motorcycle_showroom_1793817699343.jpg',
    description: 'Dual-visor pinlock ready helmet with quick-release micrometric buckle.',
  },
  {
    id: 'acc-warranty-ext',
    name: '2-Year Extended Engine & Electrical Warranty',
    category: 'Protection',
    pricePaise: 320000n, // ₹3,200
    image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg',
    description: 'All-India coverage for engine, ECU, gearbox, and electrical harness.',
  },
];

export function getColorBikeImage(bike: Motorcycle, colorName?: string): string {
  if (!colorName) return bike.image;

  // 1. Direct exact lookup in images dictionary
  if (bike.images && bike.images[colorName]) {
    return bike.images[colorName];
  }

  // 2. Lookup in availableColors
  const matchedColor = bike.availableColors.find(
    (c) => c.name.toLowerCase() === colorName.toLowerCase()
  );
  if (matchedColor?.image) {
    return matchedColor.image;
  }

  // 3. Keyword matching (e.g. 'black', 'blue', 'red', 'orange', 'white')
  if (bike.images) {
    const lower = colorName.toLowerCase();
    for (const [key, img] of Object.entries(bike.images)) {
      const keyLower = key.toLowerCase();
      if (
        keyLower.includes(lower) ||
        lower.includes(keyLower) ||
        (lower.includes('black') && keyLower.includes('black')) ||
        (lower.includes('blue') && keyLower.includes('blue')) ||
        (lower.includes('red') && keyLower.includes('red')) ||
        (lower.includes('orange') && keyLower.includes('orange')) ||
        (lower.includes('white') && keyLower.includes('white')) ||
        (lower.includes('grey') && keyLower.includes('grey')) ||
        (lower.includes('ash') && keyLower.includes('ash'))
      ) {
        return img;
      }
    }
  }

  return bike.image;
}

export const INITIAL_BIKES: Motorcycle[] = [
  {
    id: 'bike-re-hunter-350',
    brand: 'Royal Enfield',
    model: 'Hunter 350',
    variant: 'Dapper Series (Dual Channel ABS)',
    category: 'Roadster',
    exShowroomPaise: 14990000n, // ₹1,49,900
    rtoTaxPaise: 1648900n,       // ₹16,489 (MH-04 Individual 11%)
    insurancePaise: 1120000n,    // ₹11,200 (1-yr OD + 5-yr TP)
    handlingPaise: 150000n,      // ₹1,500
    engineCc: 349,
    powerBhp: 20.2,
    torqueNm: 27.0,
    mileageKmpl: 36.2,
    kerbWeightKg: 181,
    fuelCapacityL: 13.0,
    availableColors: [
      {
        name: 'Dapper Ash',
        hex: '#4b5563',
        image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
      },
      {
        name: 'Dapper Grey',
        hex: '#6b7280',
        image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
      },
      {
        name: 'Rebel Red',
        hex: '#dc2626',
        image: '/assets/images/hunter_red_bike_1793848015303.jpg',
      },
      {
        name: 'Rebel Black',
        hex: '#111827',
        image: '/assets/images/bike_hunter_black_1793847664578.jpg',
      },
      {
        name: 'Rebel Blue',
        hex: '#1d4ed8',
        image: '/assets/images/bike_hunter_blue_1793847645697.jpg',
      },
    ],
    selectedColor: 'Dapper Ash',
    images: {
      'Dapper Ash': '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
      'Dapper Grey': '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
      'Rebel Red': '/assets/images/hunter_red_bike_1793848015303.jpg',
      'Rebel Black': '/assets/images/bike_hunter_black_1793847664578.jpg',
      'Rebel Blue': '/assets/images/bike_hunter_blue_1793847645697.jpg',
      'Black': '/assets/images/bike_hunter_black_1793847664578.jpg',
      'Blue': '/assets/images/bike_hunter_blue_1793847645697.jpg',
      'Red': '/assets/images/hunter_red_bike_1793848015303.jpg',
      'Grey': '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
    },
    inStockCount: 4,
    featured: true,
    arrivedAt: '2026-10-28',
    image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg',
    description: 'A nimble, agile urban roadster built on the renowned J-series engine. Perfect for cruising Thane Ghodbunder curves and daily Mumbai commutes.',
  },
  {
    id: 'bike-triumph-speed-400',
    brand: 'Triumph',
    model: 'Speed 400',
    variant: 'Standard Roadster',
    category: 'Roadster',
    exShowroomPaise: 23449700n, // ₹2,34,497
    rtoTaxPaise: 2814000n,       // ₹28,140 (MH-04)
    insurancePaise: 1630000n,    // ₹16,300
    handlingPaise: 200000n,
    engineCc: 398,
    powerBhp: 40.0,
    torqueNm: 37.5,
    mileageKmpl: 30.0,
    kerbWeightKg: 176,
    fuelCapacityL: 13.0,
    availableColors: [
      {
        name: 'Carnival Red',
        hex: '#b91c1c',
        image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg',
      },
      {
        name: 'Caspian Blue',
        hex: '#1e3a8a',
        image: '/assets/images/bike_speed400_blue_1793847681418.jpg',
      },
      {
        name: 'Phantom Black',
        hex: '#0f172a',
        image: '/assets/images/bike_speed400_black_1793847697134.jpg',
      },
    ],
    selectedColor: 'Carnival Red',
    images: {
      'Carnival Red': '/assets/images/bike_triumph_speed_400_1793818520492.jpg',
      'Caspian Blue': '/assets/images/bike_speed400_blue_1793847681418.jpg',
      'Phantom Black': '/assets/images/bike_speed400_black_1793847697134.jpg',
      'Red': '/assets/images/bike_triumph_speed_400_1793818520492.jpg',
      'Blue': '/assets/images/bike_speed400_blue_1793847681418.jpg',
      'Black': '/assets/images/bike_speed400_black_1793847697134.jpg',
    },
    inStockCount: 2,
    featured: true,
    arrivedAt: '2026-10-19',
    image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg',
    description: 'British engineering heritage meets modern roadster capability. TR-series DOHC engine with upside-down big piston forks and switchable traction control.',
  },
  {
    id: 'bike-ktm-duke-390',
    brand: 'KTM',
    model: '390 Duke (Gen 3)',
    variant: 'Electronic Orange Trellis',
    category: 'Sport',
    exShowroomPaise: 31052000n, // ₹3,10,520
    rtoTaxPaise: 3726200n,       // ₹37,262
    insurancePaise: 1980000n,    // ₹19,800
    handlingPaise: 200000n,      // ₹2,000
    engineCc: 399,
    powerBhp: 45.3,
    torqueNm: 39.0,
    mileageKmpl: 28.5,
    kerbWeightKg: 168,
    fuelCapacityL: 15.0,
    availableColors: [
      {
        name: 'Electronic Orange',
        hex: '#ea580c',
        image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg',
      },
      {
        name: 'Atlantic Blue',
        hex: '#1d4ed8',
        image: '/assets/images/bike_duke390_blue_1793847713369.jpg',
      },
      {
        name: 'Dark Galvano Black',
        hex: '#111827',
        image: '/assets/images/bike_duke390_black_1793847731027.jpg',
      },
    ],
    selectedColor: 'Electronic Orange',
    images: {
      'Electronic Orange': '/assets/images/bike_ktm_duke_390_1793817701221.jpg',
      'Atlantic Blue': '/assets/images/bike_duke390_blue_1793847713369.jpg',
      'Dark Galvano Black': '/assets/images/bike_duke390_black_1793847731027.jpg',
      'Orange': '/assets/images/bike_ktm_duke_390_1793817701221.jpg',
      'Blue': '/assets/images/bike_duke390_blue_1793847713369.jpg',
      'Black': '/assets/images/bike_duke390_black_1793847731027.jpg',
    },
    inStockCount: 2,
    featured: true,
    arrivedAt: '2026-09-12',
    image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg',
    description: 'The Corner Rocket unleashed. Third-generation 399cc LC4c engine with launch control, Quickshifter+, and 5-inch TFT cockpit with Turn-by-Turn navigation.',
  },
  {
    id: 'bike-re-himalayan-450',
    brand: 'Royal Enfield',
    model: 'Himalayan 450',
    variant: 'Kamet White Tubeless Ready',
    category: 'Adventure',
    exShowroomPaise: 28500000n, // ₹2,85,000
    rtoTaxPaise: 3420000n,       // ₹34,200
    insurancePaise: 1850000n,    // ₹18,500
    handlingPaise: 200000n,
    engineCc: 452,
    powerBhp: 40.0,
    torqueNm: 40.0,
    mileageKmpl: 30.0,
    kerbWeightKg: 196,
    fuelCapacityL: 17.0,
    availableColors: [
      {
        name: 'Kamet White',
        hex: '#e2e8f0',
        image: '/assets/images/bike_himalayan_450_1793818522395.jpg',
      },
      {
        name: 'Hanle Black',
        hex: '#0f172a',
        image: '/assets/images/himalayan_black_bike_1793847981859.jpg',
      },
      {
        name: 'Kaza Brown',
        hex: '#78350f',
        image: '/assets/images/bike_himalayan_450_1793818522395.jpg',
      },
    ],
    selectedColor: 'Kamet White',
    images: {
      'Kamet White': '/assets/images/bike_himalayan_450_1793818522395.jpg',
      'Hanle Black': '/assets/images/himalayan_black_bike_1793847981859.jpg',
      'Kaza Brown': '/assets/images/bike_himalayan_450_1793818522395.jpg',
      'White': '/assets/images/bike_himalayan_450_1793818522395.jpg',
      'Black': '/assets/images/himalayan_black_bike_1793847981859.jpg',
    },
    inStockCount: 2,
    featured: true,
    arrivedAt: '2026-10-30',
    image: '/assets/images/bike_himalayan_450_1793818522395.jpg',
    description: 'Purpose-built for demanding terrains. All-new liquid-cooled Sherpa 450 motor, Showa upside down forks, 230mm ground clearance, and Tripper Dash with Google Maps integration.',
  },
  {
    id: 'bike-yamaha-aerox-155',
    brand: 'Yamaha',
    model: 'Aerox 155',
    variant: 'Version S with Traction Control & Smart Key',
    category: 'Scooter',
    exShowroomPaise: 14830000n, // ₹1,48,300
    rtoTaxPaise: 1483000n,       // ₹14,830
    insurancePaise: 1040000n,    // ₹10,400
    handlingPaise: 150000n,      // ₹1,500
    engineCc: 155,
    powerBhp: 15.0,
    torqueNm: 13.9,
    mileageKmpl: 42.0,
    kerbWeightKg: 126,
    fuelCapacityL: 5.5,
    availableColors: [
      {
        name: 'Racing Blue',
        hex: '#2563eb',
        image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
      },
      {
        name: 'Metallic Black',
        hex: '#18181b',
        image: '/assets/images/aerox_black_scooter_1793847999766.jpg',
      },
      {
        name: 'Grey Vermillion',
        hex: '#ef4444',
        image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
      },
    ],
    selectedColor: 'Racing Blue',
    images: {
      'Racing Blue': '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
      'Metallic Black': '/assets/images/aerox_black_scooter_1793847999766.jpg',
      'Grey Vermillion': '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
      'Blue': '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
      'Black': '/assets/images/aerox_black_scooter_1793847999766.jpg',
    },
    inStockCount: 3,
    featured: false,
    arrivedAt: '2026-08-08',
    image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg',
    description: 'Liquid-cooled 155cc 4-valve VVA powerplant inside a high-rigidity underbone frame. Uncompromising maxi-sports scooter with Class-D LED twin headlights.',
  },
  // Certified Pre-Owned (Second Hand)
  {
    id: 'bike-used-re-classic-350',
    brand: 'Royal Enfield',
    model: 'Classic 350 Reborn (Certified Pre-Owned)',
    variant: 'Halcyon Black Dual Channel ABS',
    category: 'Cruiser',
    exShowroomPaise: 15500000n, // ₹1,55,000 All-Inclusive Certified
    rtoTaxPaise: 0n,
    insurancePaise: 0n,
    handlingPaise: 0n,
    engineCc: 349,
    powerBhp: 20.2,
    torqueNm: 27.0,
    mileageKmpl: 35.0,
    kerbWeightKg: 195,
    fuelCapacityL: 13.0,
    availableColors: [
      {
        name: 'Halcyon Black',
        hex: '#1c1917',
        image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
      },
      {
        name: 'Signals Sand',
        hex: '#b45309',
        image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
      },
    ],
    selectedColor: 'Halcyon Black',
    images: {
      'Halcyon Black': '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
      'Signals Sand': '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
      'Black': '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
    },
    isUsed: true,
    year: 2023,
    odometerKm: 9840,
    inStockCount: 1,
    featured: false,
    arrivedAt: '2026-10-05',
    image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg',
    description: 'Thane Central (MH-04) registered, single IT professional owner, full showroom service records, zero insurance claims. Certified with 45-point PDI & 6-month engine warranty.',
  },
  {
    id: 'bike-used-bajaj-pulsar-200',
    brand: 'Bajaj',
    model: 'Pulsar NS200 (Certified Pre-Owned)',
    variant: 'Dual Channel ABS Gloss Black',
    category: 'Sport',
    exShowroomPaise: 11800000n, // ₹1,18,000 All-Inclusive Certified
    rtoTaxPaise: 0n,
    insurancePaise: 0n,
    handlingPaise: 0n,
    engineCc: 199,
    powerBhp: 24.5,
    torqueNm: 18.7,
    mileageKmpl: 36.0,
    kerbWeightKg: 158,
    fuelCapacityL: 12.0,
    availableColors: [
      {
        name: 'Gloss Black',
        hex: '#000000',
        image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
      },
      {
        name: 'Burnt Red',
        hex: '#b91c1c',
        image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
      },
    ],
    selectedColor: 'Gloss Black',
    images: {
      'Gloss Black': '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
      'Burnt Red': '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
      'Black': '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
    },
    isUsed: true,
    year: 2023,
    odometerKm: 11400,
    inStockCount: 1,
    featured: false,
    arrivedAt: '2026-09-27',
    image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg',
    description: 'Well-maintained streetfighter. Liquid-cooled triple spark DTS-i engine, upside-down forks, new MRF tyres, pristine engine condition. Clean MH-04 transfer ready.',
  },
];

export const INITIAL_STOCK_UNITS: StockUnit[] = [
  {
    id: 'unit-tby-101',
    chassisNumber: 'ME3J350HUN20268819',
    engineNumber: 'J350E1894231',
    bikeId: 'bike-re-hunter-350',
    bikeModel: 'Royal Enfield Hunter 350',
    variant: 'Dapper Series',
    color: 'Dapper Ash',
    purchasePricePaise: 13200000n,
    status: 'IN_STOCK',
    location: 'Floor 1 — Showroom Front Display',
    inwardDate: '2026-10-18T06:00:00.000Z',
    pdiPassed: true,
  },
  {
    id: 'unit-tby-102',
    chassisNumber: 'ME3J350HUN20268820',
    engineNumber: 'J350E1894232',
    bikeId: 'bike-re-hunter-350',
    bikeModel: 'Royal Enfield Hunter 350',
    variant: 'Dapper Series',
    color: 'Rebel Red',
    purchasePricePaise: 13200000n,
    status: 'RESERVED',
    location: 'Yard Bay 3 (Pre-Delivery Bay)',
    inwardDate: '2026-10-20T08:30:00.000Z',
    pdiPassed: true,
  },
  {
    id: 'unit-tby-103',
    chassisNumber: 'VBKDK390LC42026991',
    engineNumber: 'LC4C9381022',
    bikeId: 'bike-ktm-duke-390',
    bikeModel: 'KTM 390 Duke',
    variant: 'Electronic Orange',
    color: 'Electronic Orange',
    purchasePricePaise: 27500000n,
    status: 'IN_STOCK',
    location: 'Floor 1 — Performance Podium',
    inwardDate: '2026-10-24T10:00:00.000Z',
    pdiPassed: true,
  },
  {
    id: 'unit-tby-104',
    chassisNumber: 'ME1RG155AER2026411',
    engineNumber: 'G3J1E0948123',
    bikeId: 'bike-yamaha-aerox-155',
    bikeModel: 'Yamaha Aerox 155',
    variant: 'Version S',
    color: 'Racing Blue',
    purchasePricePaise: 13000000n,
    status: 'IN_STOCK',
    location: 'Floor 1 — Scooter Island',
    inwardDate: '2026-10-28T09:15:00.000Z',
    pdiPassed: true,
  },
  {
    id: 'unit-tby-105',
    chassisNumber: 'SMTT400SPD2026008',
    engineNumber: 'TR400E774819',
    bikeId: 'bike-triumph-speed-400',
    bikeModel: 'Triumph Speed 400',
    variant: 'Standard',
    color: 'Carnival Red',
    purchasePricePaise: 20600000n,
    status: 'IN_STOCK',
    location: 'Floor 1 — British Roadster Bay',
    inwardDate: '2026-10-12T05:00:00.000Z',
    pdiPassed: true,
  },
  {
    id: 'unit-tby-106',
    chassisNumber: 'ME3H450HIM2026102',
    engineNumber: 'SHERPA450E9182',
    bikeId: 'bike-re-himalayan-450',
    bikeModel: 'Royal Enfield Himalayan 450',
    variant: 'Kamet White',
    color: 'Kamet White',
    purchasePricePaise: 25100000n,
    status: 'IN_STOCK',
    location: 'Floor 1 — Adventure Arena',
    inwardDate: '2026-10-30T07:00:00.000Z',
    pdiPassed: true,
  },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-201',
    fullName: 'Aditya Sharad Kulkarni',
    phone: '9820144912',
    email: 'aditya.kulkarni@gmail.com',
    address: 'Flat 902, Vasant Vihar Heights, Pokhran Road 2',
    city: 'Thane (West)',
    panNumber: 'ABCDE1234F',
    createdAt: '2026-10-15T09:00:00.000Z',
  },
  {
    id: 'cust-202',
    fullName: 'Pooja Nitin Deshmukh',
    phone: '9833418290',
    email: 'pooja.deshmukh@yahoo.com',
    address: 'B-403, Cosmos Heritage, Tikuji-ni-Wadi Road, Manpada',
    city: 'Thane (West)',
    panNumber: 'BPQPD9821K',
    createdAt: '2026-10-21T11:30:00.000Z',
  },
  {
    id: 'cust-203',
    fullName: 'Rohan R. Mehta',
    phone: '9769023411',
    email: 'rohan.mehta@outlook.com',
    address: 'A-12, Panch Pakhadi, Near Teen Hath Naka',
    city: 'Thane (West)',
    createdAt: '2026-10-26T14:15:00.000Z',
  },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'book-tby-501',
    bookingNumber: 'TBY-BK-2026-089',
    customerId: 'cust-201',
    customerName: 'Aditya Sharad Kulkarni',
    customerPhone: '9820144912',
    bikeId: 'bike-re-hunter-350',
    bikeModel: 'Royal Enfield Hunter 350',
    variant: 'Dapper Series',
    color: 'Rebel Red',
    advanceAmountPaise: 1000000n, // ₹10,000 Advance
    status: 'ACTIVE',
    stockUnitId: 'unit-tby-102',
    createdDate: '2026-10-22T08:00:00.000Z',
    tentativeDeliveryDate: '2026-11-08',
    salesExecutiveName: 'Suraj Patil',
  },
  {
    id: 'book-tby-502',
    bookingNumber: 'TBY-BK-2026-090',
    customerId: 'cust-202',
    customerName: 'Pooja Nitin Deshmukh',
    customerPhone: '9833418290',
    bikeId: 'bike-yamaha-aerox-155',
    bikeModel: 'Yamaha Aerox 155',
    variant: 'Version S',
    color: 'Racing Blue',
    advanceAmountPaise: 1500000n, // ₹15,000 Advance
    status: 'ACTIVE',
    createdDate: '2026-10-27T10:30:00.000Z',
    tentativeDeliveryDate: '2026-11-12',
    salesExecutiveName: 'Neha Shinde',
  },
];

export const INITIAL_SALES: Sale[] = [
  {
    id: 'sale-901',
    invoiceNumber: 'TBY-INV-2026-044',
    customerId: 'cust-203',
    customerName: 'Rohan R. Mehta',
    stockUnitId: 'unit-tby-105',
    bikeModel: 'Triumph Speed 400',
    chassisNumber: 'SMTT400SPD2026008',
    engineNumber: 'TR400E774819',
    exShowroomPaise: 23449700n,
    gstAmountPaise: 4220946n,
    cgstPaise: 2110473n,
    sgstPaise: 2110473n,
    igstPaise: 0n,
    rtoPaise: 2814000n,
    insurancePaise: 1630000n,
    accessoriesPaise: 450000n,
    totalOnRoadPaise: 28343700n,
    advanceCarriedPaise: 2500000n,
    amountPaidPaise: 28343700n,
    outstandingPaise: 0n,
    saleDate: '2026-10-25T11:00:00.000Z',
    salesExecutive: 'Suraj Patil',
    status: 'DELIVERED',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-701',
    receiptNumber: 'TBY-RCP-2026-189',
    referenceType: 'BOOKING',
    referenceId: 'book-tby-501',
    amountPaise: 1000000n,
    mode: 'UPI',
    transactionRef: 'UPI/630129481920/HDFC',
    receivedBy: 'Neha Shinde',
    paymentDate: '2026-10-22T08:05:00.000Z',
    status: 'SUCCESS',
  },
];

export const INITIAL_REFUNDS: Refund[] = [
  {
    id: 'ref-301',
    refundNumber: 'TBY-REF-2026-004',
    paymentId: 'pay-prior-sample',
    bookingNumber: 'TBY-BK-2026-074',
    customerName: 'Vikram Joshi',
    amountPaise: 500000n,
    reason: 'Customer relocated to Pune; cancelled booking within grace window',
    requestedBy: 'Suraj Patil (Sales Exec)',
    approvedBy: 'Rajesh Gokhale (Accountant)',
    status: 'COMPLETED',
    requestedAt: '2026-10-14T09:20:00.000Z',
    processedAt: '2026-10-15T11:00:00.000Z',
  },
];

export const INITIAL_TEST_RIDES: TestRide[] = [
  {
    id: 'tr-401',
    customerName: 'Samir Pawar',
    customerPhone: '9819034211',
    bikeModel: 'KTM 390 Duke',
    preferredDate: '2026-11-05',
    preferredTimeSlot: '11:30 AM',
    hasValidLicense: true,
    status: 'SCHEDULED',
    assignedStaff: 'Suraj Patil',
  },
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-601',
    customerName: 'Prashant Sawant',
    phone: '9821098432',
    bikeOfInterest: 'Triumph Speed 400',
    source: 'WEBSITE',
    stage: 'TEST_RIDE',
    assignedTo: 'Suraj Patil',
    notes: 'Scheduled test ride for Saturday.',
    createdAt: '2026-11-02T05:30:00.000Z',
  },
];

export const INITIAL_STAFF_TASKS: StaffTask[] = [
  {
    id: 'task-801',
    title: 'PDI Check for Hunter 350 (Unit 102)',
    category: 'PDI',
    assignedTo: 'Kiran Mane (Technician)',
    dueTime: 'Today 02:00 PM',
    isCompleted: false,
    priority: 'HIGH',
  },
];

export const FAQS = [
  {
    q: 'Where is The Bike Yard showroom located in Thane?',
    a: 'We are situated at Shop 4 & 5, Rutu Business Park, right near Cadbury Junction on Eastern Express Highway / Khopat, Thane (West), Maharashtra 400601.',
  },
  {
    q: 'How is On-Road price calculated in Maharashtra (MH-04 Thane)?',
    a: 'The on-road price comprises: Ex-showroom price (inclusive of GST), Maharashtra RTO registration tax (approx 10-12% for non-transport two-wheelers depending on engine capacity), 1-Year Own Damage + 5-Year Third Party IRDAI mandatory insurance, and dealer logistics/number plate fitment.',
  },
  {
    q: 'Which two-wheeler finance partners are available in-store?',
    a: 'We have 10 institutional finance partners: Bajaj Finance, HDFC Bank, Kotak Prime, TVS Credit, Muthoot Capital, IDFC FIRST Bank, Tata Capital, L&T Finance, Hero FinCorp, and IndusInd Bank. Approvals in 15–45 minutes with Aadhaar OTP.',
  },
  {
    q: 'What is the booking advance amount and cancellation policy?',
    a: 'Booking advance ranges from ₹5,000 to ₹15,000 depending on model tier. If you cancel prior to chassis allocation/RTO filing, ₹500 administrative fee applies and the balance is refunded directly to your original bank account within 3-5 working days.',
  },
  {
    q: 'Are test rides free and what documents are required?',
    a: 'Test rides are 100% complimentary. You must hold an active Indian Driving License (Two-Wheeler with Gear) and wear a helmet and closed footwear (we also provide sanitized ISI-certified helmets at the showroom).',
  },
];

/**
 * Current dealership offers (merchandising — safe for staff to manage in admin).
 * These are the showroom's own promotions, not manufacturer specifications.
 */
export const INITIAL_OFFERS: Offer[] = [
  {
    id: 'offer-festive-exchange',
    type: 'EXCHANGE',
    title: 'Festive Exchange Bonus',
    description: 'Exchange your old motorcycle and get up to ₹10,000 extra on the assessed value. Free RTO transfer paperwork for MH-04 / MH-02 / MH-03.',
    badge: 'Festive',
    validTill: '2026-11-30',
    active: true,
    createdAt: '2026-10-25T09:00:00.000Z',
  },
  {
    id: 'offer-finance-zero-pf',
    type: 'FINANCE',
    title: 'Zero Processing Fee — Bajaj Finance & HDFC',
    description: 'Zero loan processing fee on two-wheeler finance via Bajaj Finance and HDFC Bank Two-Wheeler Loans. Min. 15% down payment, approval in ~45 minutes in-store.',
    badge: 'Finance',
    validTill: '2026-12-31',
    active: true,
    createdAt: '2026-10-20T09:00:00.000Z',
  },
  {
    id: 'offer-accessory-rider-kit',
    type: 'ACCESSORY',
    title: 'Free Rider Kit on Duke 390 & Speed 400',
    description: 'Complimentary ISI-certified helmet, tank pad and crash guard with KTM 390 Duke or Triumph Speed 400 bookings. Subject to showroom stock of accessory kits.',
    badge: 'Accessories',
    validTill: '2026-12-15',
    active: true,
    createdAt: '2026-11-01T09:00:00.000Z',
  },
  {
    id: 'offer-service-honda-tvs',
    type: 'WARRANTY',
    title: '3 Free Services on Honda & TVS Commuters',
    description: 'Complimentary 3 periodic services (labour only) on Honda Activa 6G, Shine 125, TVS Raider 125 and Ntorq 125 purchased this month.',
    badge: 'Service',
    validTill: '2026-11-30',
    active: true,
    createdAt: '2026-11-02T09:00:00.000Z',
  },
];
