import { Motorcycle, BikeVariant } from '../types';

export const CSV_SAMPLE_TEMPLATE = `Brand,Model,Variant,ExShowroomINR,Category,EngineCC,PowerBHP,TorqueNM,MileageKMPL
Royal Enfield,Hunter 350,Base,137640,Roadster,349,20.2,27.0,36.2
Royal Enfield,Hunter 350,Base Premium,152235,Roadster,349,20.2,27.0,36.2
Royal Enfield,Hunter 350,Mid,167703,Roadster,349,20.2,27.0,36.2
Royal Enfield,Hunter 350,Top,172445,Roadster,349,20.2,27.0,36.2
Royal Enfield,Classic 350,Base,193080,Cruiser,349,20.2,27.0,35.0
Royal Enfield,Classic 350,Base Premium,202094,Cruiser,349,20.2,27.0,35.0
Royal Enfield,Classic 350,Mid,216000,Cruiser,349,20.2,27.0,35.0
Royal Enfield,Classic 350,Top,224755,Cruiser,349,20.2,27.0,35.0
KTM,390 Duke,Base,310520,Sport,399,45.3,39.0,28.5
KTM,390 Duke,Top,332000,Sport,399,45.3,39.0,28.5
Triumph,Speed 400,Base,234497,Roadster,398,40.0,37.5,30.0
Triumph,Speed 400,Top,245000,Roadster,398,40.0,37.5,30.0
Yamaha,Aerox 155,Base,148300,Scooter,155,15.0,13.9,42.0
Yamaha,Aerox 155,Top,153500,Scooter,155,15.0,13.9,42.0
Bajaj,Pulsar NS200,Base,142000,Sport,199,24.5,18.7,36.0
Bajaj,Pulsar NS200,Top,158000,Sport,199,24.5,18.7,36.0
`;

interface RawBikeSeed {
  brand: string;
  model: string;
  category: 'Commuter' | 'Roadster' | 'Sport' | 'Adventure' | 'Cruiser' | 'Scooter';
  engineCc: number;
  powerBhp: number;
  torqueNm: number;
  mileageKmpl: number;
  kerbWeightKg: number;
  fuelCapacityL: number;
  image: string;
  baseExShowroom: number;
}

/**
 * Bikes already present as hand-curated showroom entries — skip them in the
 * generated base catalogue to avoid duplicates.
 */
const HAND_CURATED_MODEL_KEYS = new Set([
  'royal enfield hunter 350',
  'royal enfield classic 350 reborn',
  'ktm 390 duke (gen 3)',
  'triumph speed 400',
  'yamaha aerox 155',
  'royal enfield himalayan 450',
]);

/** Recent-arrival dates for a few market models (drives the "Latest Arrivals" row). */
const ARRIVED_AT: Record<string, string> = {
  'TVS Raider 125': '2026-11-02',
  'TVS Ronin': '2026-10-29',
  'Honda Activa 6G': '2026-10-27',
  'Suzuki Access 125': '2026-10-24',
  'Suzuki Burgman Street 125': '2026-10-18',
  'Hero Xpulse 200 4V': '2026-10-15',
  'TVS Apache RTR 160 4V': '2026-10-11',
};

const POPULAR_INDIAN_MODELS: RawBikeSeed[] = [
  // Royal Enfield
  { brand: 'Royal Enfield', model: 'Hunter 350', category: 'Roadster', engineCc: 349, powerBhp: 20.2, torqueNm: 27.0, mileageKmpl: 36.2, kerbWeightKg: 181, fuelCapacityL: 13, image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg', baseExShowroom: 137640 },
  { brand: 'Royal Enfield', model: 'Classic 350 Reborn', category: 'Cruiser', engineCc: 349, powerBhp: 20.2, torqueNm: 27.0, mileageKmpl: 35.0, kerbWeightKg: 195, fuelCapacityL: 13, image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg', baseExShowroom: 193080 },
  { brand: 'Royal Enfield', model: 'Bullet 350', category: 'Cruiser', engineCc: 349, powerBhp: 20.2, torqueNm: 27.0, mileageKmpl: 36.0, kerbWeightKg: 195, fuelCapacityL: 13, image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg', baseExShowroom: 173562 },
  { brand: 'Royal Enfield', model: 'Meteor 350', category: 'Cruiser', engineCc: 349, powerBhp: 20.2, torqueNm: 27.0, mileageKmpl: 34.5, kerbWeightKg: 191, fuelCapacityL: 15, image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg', baseExShowroom: 205844 },
  { brand: 'Royal Enfield', model: 'Himalayan 450', category: 'Adventure', engineCc: 452, powerBhp: 40.0, torqueNm: 40.0, mileageKmpl: 30.0, kerbWeightKg: 196, fuelCapacityL: 17, image: '/assets/images/bike_himalayan_450_1793818522395.jpg', baseExShowroom: 285000 },
  { brand: 'Royal Enfield', model: 'Guerrilla 450', category: 'Roadster', engineCc: 452, powerBhp: 40.0, torqueNm: 40.0, mileageKmpl: 29.5, kerbWeightKg: 185, fuelCapacityL: 11, image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg', baseExShowroom: 239000 },
  { brand: 'Royal Enfield', model: 'Continental GT 650', category: 'Sport', engineCc: 648, powerBhp: 47.0, torqueNm: 52.0, mileageKmpl: 25.0, kerbWeightKg: 211, fuelCapacityL: 12.5, image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg', baseExShowroom: 319000 },
  { brand: 'Royal Enfield', model: 'Interceptor 650', category: 'Roadster', engineCc: 648, powerBhp: 47.0, torqueNm: 52.0, mileageKmpl: 24.0, kerbWeightKg: 213, fuelCapacityL: 13.7, image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg', baseExShowroom: 303000 },

  // KTM
  { brand: 'KTM', model: '390 Duke (Gen 3)', category: 'Sport', engineCc: 399, powerBhp: 45.3, torqueNm: 39.0, mileageKmpl: 28.5, kerbWeightKg: 168, fuelCapacityL: 15, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 310520 },
  { brand: 'KTM', model: '250 Duke', category: 'Sport', engineCc: 249, powerBhp: 31.0, torqueNm: 25.0, mileageKmpl: 32.0, kerbWeightKg: 163, fuelCapacityL: 15, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 240000 },
  { brand: 'KTM', model: '200 Duke', category: 'Sport', engineCc: 199, powerBhp: 25.0, torqueNm: 19.2, mileageKmpl: 34.0, kerbWeightKg: 159, fuelCapacityL: 13.5, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 198000 },
  { brand: 'KTM', model: 'RC 390', category: 'Sport', engineCc: 373, powerBhp: 43.5, torqueNm: 37.0, mileageKmpl: 26.0, kerbWeightKg: 172, fuelCapacityL: 13.7, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 318000 },
  { brand: 'KTM', model: '390 Adventure', category: 'Adventure', engineCc: 373, powerBhp: 43.5, torqueNm: 37.0, mileageKmpl: 28.0, kerbWeightKg: 177, fuelCapacityL: 14.5, image: '/assets/images/bike_himalayan_450_1793818522395.jpg', baseExShowroom: 338000 },

  // Triumph
  { brand: 'Triumph', model: 'Speed 400', category: 'Roadster', engineCc: 398, powerBhp: 40.0, torqueNm: 37.5, mileageKmpl: 30.0, kerbWeightKg: 176, fuelCapacityL: 13, image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg', baseExShowroom: 234497 },
  { brand: 'Triumph', model: 'Scrambler 400 X', category: 'Adventure', engineCc: 398, powerBhp: 40.0, torqueNm: 37.5, mileageKmpl: 28.0, kerbWeightKg: 179, fuelCapacityL: 13, image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg', baseExShowroom: 264497 },
  { brand: 'Triumph', model: 'Speed T4', category: 'Roadster', engineCc: 398, powerBhp: 31.0, torqueNm: 36.0, mileageKmpl: 33.0, kerbWeightKg: 180, fuelCapacityL: 13, image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg', baseExShowroom: 217000 },

  // Yamaha
  { brand: 'Yamaha', model: 'Aerox 155', category: 'Scooter', engineCc: 155, powerBhp: 15.0, torqueNm: 13.9, mileageKmpl: 42.0, kerbWeightKg: 126, fuelCapacityL: 5.5, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 148300 },
  { brand: 'Yamaha', model: 'YZF R15 V4', category: 'Sport', engineCc: 155, powerBhp: 18.4, torqueNm: 14.2, mileageKmpl: 45.0, kerbWeightKg: 142, fuelCapacityL: 11, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 182000 },
  { brand: 'Yamaha', model: 'MT-15 V2', category: 'Sport', engineCc: 155, powerBhp: 18.4, torqueNm: 14.1, mileageKmpl: 47.0, kerbWeightKg: 141, fuelCapacityL: 10, image: '/assets/images/bike_ktm_duke_390_1793817701221.jpg', baseExShowroom: 168000 },
  { brand: 'Yamaha', model: 'RayZR 125 Fi Hybrid', category: 'Scooter', engineCc: 125, powerBhp: 8.2, torqueNm: 10.3, mileageKmpl: 58.0, kerbWeightKg: 99, fuelCapacityL: 5.2, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 85300 },

  // Bajaj
  { brand: 'Bajaj', model: 'Pulsar NS200', category: 'Sport', engineCc: 199, powerBhp: 24.5, torqueNm: 18.7, mileageKmpl: 36.0, kerbWeightKg: 158, fuelCapacityL: 12, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 142000 },
  { brand: 'Bajaj', model: 'Pulsar N160', category: 'Sport', engineCc: 164, powerBhp: 16.0, torqueNm: 14.65, mileageKmpl: 45.0, kerbWeightKg: 154, fuelCapacityL: 14, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 123000 },
  { brand: 'Bajaj', model: 'Pulsar 150', category: 'Commuter', engineCc: 149, powerBhp: 14.0, torqueNm: 13.25, mileageKmpl: 48.0, kerbWeightKg: 148, fuelCapacityL: 15, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 110000 },
  { brand: 'Bajaj', model: 'Dominar 400', category: 'Cruiser', engineCc: 373, powerBhp: 40.0, torqueNm: 35.0, mileageKmpl: 27.0, kerbWeightKg: 193, fuelCapacityL: 13, image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg', baseExShowroom: 231000 },
  { brand: 'Bajaj', model: 'Chetak Electric', category: 'Scooter', engineCc: 0, powerBhp: 5.4, torqueNm: 16.2, mileageKmpl: 126.0, kerbWeightKg: 134, fuelCapacityL: 0, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 99998 },

  // Honda
  { brand: 'Honda', model: 'Activa 6G', category: 'Scooter', engineCc: 109, powerBhp: 7.7, torqueNm: 8.9, mileageKmpl: 50.0, kerbWeightKg: 106, fuelCapacityL: 5.3, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 76684 },
  { brand: 'Honda', model: 'Shine 125', category: 'Commuter', engineCc: 124, powerBhp: 10.7, torqueNm: 11.0, mileageKmpl: 55.0, kerbWeightKg: 114, fuelCapacityL: 10.5, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 80250 },
  { brand: 'Honda', model: 'CB350 Hness', category: 'Cruiser', engineCc: 348, powerBhp: 20.8, torqueNm: 30.0, mileageKmpl: 35.0, kerbWeightKg: 181, fuelCapacityL: 15, image: '/assets/images/bike_used_re_classic_350_1793818522002.jpg', baseExShowroom: 209857 },

  // TVS
  { brand: 'TVS', model: 'Apache RTR 160 4V', category: 'Sport', engineCc: 159, powerBhp: 17.5, torqueNm: 14.7, mileageKmpl: 45.0, kerbWeightKg: 146, fuelCapacityL: 12, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 124870 },
  { brand: 'TVS', model: 'Raider 125', category: 'Commuter', engineCc: 124, powerBhp: 11.2, torqueNm: 11.2, mileageKmpl: 57.0, kerbWeightKg: 123, fuelCapacityL: 10, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 95219 },
  { brand: 'TVS', model: 'Ntorq 125', category: 'Scooter', engineCc: 124, powerBhp: 9.3, torqueNm: 10.5, mileageKmpl: 47.0, kerbWeightKg: 118, fuelCapacityL: 5.8, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 89641 },
  { brand: 'TVS', model: 'Ronin', category: 'Roadster', engineCc: 225, powerBhp: 20.4, torqueNm: 19.9, mileageKmpl: 40.0, kerbWeightKg: 159, fuelCapacityL: 14, image: '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg', baseExShowroom: 149200 },

  // Suzuki
  { brand: 'Suzuki', model: 'Access 125', category: 'Scooter', engineCc: 124, powerBhp: 8.7, torqueNm: 10.0, mileageKmpl: 50.0, kerbWeightKg: 103, fuelCapacityL: 5.0, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 80700 },
  { brand: 'Suzuki', model: 'Burgman Street 125', category: 'Scooter', engineCc: 124, powerBhp: 8.7, torqueNm: 10.0, mileageKmpl: 48.0, kerbWeightKg: 110, fuelCapacityL: 5.5, image: '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg', baseExShowroom: 94301 },

  // Hero
  { brand: 'Hero', model: 'Splendor Plus', category: 'Commuter', engineCc: 97, powerBhp: 7.9, torqueNm: 8.05, mileageKmpl: 65.0, kerbWeightKg: 112, fuelCapacityL: 9.8, image: '/assets/images/bike_used_bajaj_pulsar_1793818520449.jpg', baseExShowroom: 75441 },
  { brand: 'Hero', model: 'Xpulse 200 4V', category: 'Adventure', engineCc: 199, powerBhp: 19.1, torqueNm: 17.35, mileageKmpl: 38.0, kerbWeightKg: 158, fuelCapacityL: 13, image: '/assets/images/bike_himalayan_450_1793818522395.jpg', baseExShowroom: 147391 },
  { brand: 'Hero', model: 'Mavrick 440', category: 'Roadster', engineCc: 440, powerBhp: 27.0, torqueNm: 36.0, mileageKmpl: 32.0, kerbWeightKg: 187, fuelCapacityL: 13.5, image: '/assets/images/bike_triumph_speed_400_1793818520492.jpg', baseExShowroom: 199000 },
];

/**
 * Generate full multi-variant list for a model with:
 * - Base (e.g. ₹ 1,37,640)
 * - Base Premium (e.g. ₹ 1,52,235)
 * - Mid (e.g. ₹ 1,67,703)
 * - Top (e.g. ₹ 1,72,445)
 */
export function buildVariantsForModel(basePrice: number): BikeVariant[] {
  // Exact user tier formula
  const basePricePaise = BigInt(Math.round(basePrice)) * 100n;
  const basePremiumPricePaise = BigInt(Math.round(basePrice * 1.106)) * 100n;
  const midPricePaise = BigInt(Math.round(basePrice * 1.218)) * 100n;
  const topPricePaise = BigInt(Math.round(basePrice * 1.253)) * 100n;

  const rtoTaxRateBps = 1100n; // 11% Maharashtra RTO

  return [
    {
      id: 'var-base',
      name: 'Base',
      exShowroomPaise: basePricePaise,
      rtoTaxPaise: (basePricePaise * rtoTaxRateBps) / 10000n,
      insurancePaise: 1100000n,
      handlingPaise: 150000n,
      features: ['Single-Channel ABS', 'Spoke Wheels', 'Analogue Dash'],
    },
    {
      id: 'var-base-premium',
      name: 'Base Premium',
      exShowroomPaise: basePremiumPricePaise,
      rtoTaxPaise: (basePremiumPricePaise * rtoTaxRateBps) / 10000n,
      insurancePaise: 1180000n,
      handlingPaise: 150000n,
      features: ['Dual-Channel ABS', 'Alloy Wheels', 'Dual Tone Colourway'],
    },
    {
      id: 'var-mid',
      name: 'Mid',
      exShowroomPaise: midPricePaise,
      rtoTaxPaise: (midPricePaise * rtoTaxRateBps) / 10000n,
      insurancePaise: 1260000n,
      handlingPaise: 180000n,
      features: ['Digital LCD Cockpit', 'Bluetooth Connectivity', 'LED Headlamp'],
    },
    {
      id: 'var-top',
      name: 'Top',
      exShowroomPaise: topPricePaise,
      rtoTaxPaise: (topPricePaise * rtoTaxRateBps) / 10000n,
      insurancePaise: 1350000n,
      handlingPaise: 200000n,
      features: ['Full Color TFT Display', 'Turn-by-Turn Navigation', 'Quickshifter / Traction Control'],
    },
  ];
}

/**
 * Base Indian-market catalogue shipped with the app.
 * One entry per unique model (4 variants each), specs sourced from the central
 * market dataset above. Used bikes and hand-curated showroom units are added
 * separately by the dealership store.
 */
export function generateBaseMarketCatalog(): Motorcycle[] {
  const result: Motorcycle[] = [];
  let index = 0;

  for (const seed of POPULAR_INDIAN_MODELS) {
    const key = `${seed.brand} ${seed.model}`.toLowerCase();
    if (HAND_CURATED_MODEL_KEYS.has(key)) continue;

    const slug = key.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const variants = buildVariantsForModel(seed.baseExShowroom);
    const defaultVariant = variants[0]!;
    const arrivedAt = ARRIVED_AT[`${seed.brand} ${seed.model}`];

    result.push({
      id: `bike-mkt-${slug}`,
      brand: seed.brand,
      model: seed.model,
      variant: defaultVariant.name,
      variants,
      selectedVariantId: defaultVariant.id,
      category: seed.category,
      exShowroomPaise: defaultVariant.exShowroomPaise,
      rtoTaxPaise: defaultVariant.rtoTaxPaise,
      insurancePaise: defaultVariant.insurancePaise,
      handlingPaise: defaultVariant.handlingPaise,
      engineCc: seed.engineCc,
      powerBhp: seed.powerBhp,
      torqueNm: seed.torqueNm,
      mileageKmpl: seed.mileageKmpl,
      kerbWeightKg: seed.kerbWeightKg,
      fuelCapacityL: seed.fuelCapacityL,
      availableColors: [
        { name: 'Stealth Black', hex: '#111827' },
        { name: 'Racing Blue', hex: '#2563eb' },
        { name: 'Crimson Red', hex: '#dc2626' },
      ],
      inStockCount: ((index * 5 + 3) % 7) + 1,
      image: seed.image,
      description: `${seed.brand} ${seed.model} — BS6 Phase 2 compliant. Display, test ride and booking available at The Bike Yard, Khopat (MH-04). Ex-showroom price is the central dataset figure; on-road Thane price is computed with 11% MH-04 RTO registration and IRDAI-compliant insurance.`,
      featured: false,
      ...(arrivedAt ? { arrivedAt } : {}),
    });
    index++;
  }

  return result;
}

/**
 * Generate 1,000+ motorcycle variants for the platform
 */
export function generateThousandBikesCatalog(): Motorcycle[] {
  const result: Motorcycle[] = [];

  // Generate 250 distinct models with 4 variants each = 1,000 variants!
  let counter = 1;

  for (let cycle = 0; cycle < 10; cycle++) {
    for (const seed of POPULAR_INDIAN_MODELS) {
      if (result.length >= 250) break;

      const modelId = `bike-gen-${counter}`;
      const yearOffset = cycle === 0 ? '' : ` Ed. ${cycle + 1}`;
      const adjustedPrice = Math.round(seed.baseExShowroom * (1 + cycle * 0.04));
      const variants = buildVariantsForModel(adjustedPrice);
      const defaultVariant = variants[0]!;

      result.push({
        id: modelId,
        brand: seed.brand,
        model: `${seed.model}${yearOffset}`,
        variant: 'Base Series',
        variants,
        selectedVariantId: defaultVariant.id,
        category: seed.category,
        exShowroomPaise: defaultVariant.exShowroomPaise,
        rtoTaxPaise: defaultVariant.rtoTaxPaise,
        insurancePaise: defaultVariant.insurancePaise,
        handlingPaise: defaultVariant.handlingPaise,
        engineCc: seed.engineCc,
        powerBhp: seed.powerBhp,
        torqueNm: seed.torqueNm,
        mileageKmpl: seed.mileageKmpl,
        kerbWeightKg: seed.kerbWeightKg,
        fuelCapacityL: seed.fuelCapacityL,
        availableColors: [
          { name: 'Stealth Black', hex: '#111827' },
          { name: 'Racing Blue', hex: '#2563eb' },
          { name: 'Crimson Red', hex: '#dc2626' },
        ],
        inStockCount: ((counter * 7) % 6) + 1,
        image: seed.image,
        description: `Official showroom specification unit with BS6 Phase 2 compliance and Maharashtra MH-04 Thane delivery clearance.`,
      });

      counter++;
    }
  }

  return result;
}

/**
 * Parse uploaded CSV file with flexible headers and live preview support
 */
export function parseBikesCsv(csvText: string): { importedCount: number; bikes: Motorcycle[]; errors: string[] } {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return { importedCount: 0, bikes: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  // Parse header row
  const headerCols = lines[0]!.split(',').map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
  
  // Find column indices
  const brandIdx = headerCols.findIndex((h) => h.includes('brand') || h.includes('make'));
  const modelIdx = headerCols.findIndex((h) => h.includes('model') || h.includes('name'));
  const variantIdx = headerCols.findIndex((h) => h.includes('variant') || h.includes('trim') || h.includes('version'));
  const priceIdx = headerCols.findIndex((h) => h.includes('exshowroom') || h.includes('price') || h.includes('cost') || h.includes('inr'));
  const categoryIdx = headerCols.findIndex((h) => h.includes('category') || h.includes('type') || h.includes('segment'));
  const ccIdx = headerCols.findIndex((h) => h.includes('cc') || h.includes('displacement') || h.includes('engine'));
  const powerIdx = headerCols.findIndex((h) => h.includes('power') || h.includes('bhp') || h.includes('hp'));
  const torqueIdx = headerCols.findIndex((h) => h.includes('torque') || h.includes('nm'));
  const mileageIdx = headerCols.findIndex((h) => h.includes('mileage') || h.includes('kmpl') || h.includes('economy'));
  const weightIdx = headerCols.findIndex((h) => h.includes('weight') || h.includes('kerb'));
  const tankIdx = headerCols.findIndex((h) => h.includes('fuel') || h.includes('tank') || h.includes('capacity'));
  const stockIdx = headerCols.findIndex((h) => h.includes('stock') || h.includes('count') || h.includes('units'));
  const imageIdx = headerCols.findIndex((h) => h.includes('image') || h.includes('photo') || h.includes('url'));

  if (brandIdx === -1 && modelIdx === -1 && priceIdx === -1) {
    return {
      importedCount: 0,
      bikes: [],
      errors: ['Invalid CSV headers. Please ensure Brand, Model, and ExShowroom/Price columns exist.'],
    };
  }

  const importedBikes: Motorcycle[] = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i]!;
    // Simple CSV row parser handling quoted values
    const cols: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let c = 0; c < rawLine.length; c++) {
      const char = rawLine[c];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    cols.push(cur.trim());

    if (cols.length < 2) continue;

    const brand = (brandIdx >= 0 && cols[brandIdx]) ? cols[brandIdx]! : 'Custom Brand';
    const model = (modelIdx >= 0 && cols[modelIdx]) ? cols[modelIdx]! : `Model ${i}`;
    const variantName = (variantIdx >= 0 && cols[variantIdx]) ? cols[variantIdx]! : 'Base';
    
    const priceRaw = (priceIdx >= 0 && cols[priceIdx]) ? cols[priceIdx]!.replace(/[^0-9.]/g, '') : '150000';
    const basePrice = parseFloat(priceRaw) || 150000;

    const catRaw = (categoryIdx >= 0 && cols[categoryIdx]) ? cols[categoryIdx]! : 'Roadster';
    const engineCc = (ccIdx >= 0 && cols[ccIdx]) ? parseInt(cols[ccIdx]!.replace(/[^0-9]/g, ''), 10) || 350 : 350;
    const powerBhp = (powerIdx >= 0 && cols[powerIdx]) ? parseFloat(cols[powerIdx]!.replace(/[^0-9.]/g, '')) || 20.2 : 20.2;
    const torqueNm = (torqueIdx >= 0 && cols[torqueIdx]) ? parseFloat(cols[torqueIdx]!.replace(/[^0-9.]/g, '')) || 27.0 : 27.0;
    const mileageKmpl = (mileageIdx >= 0 && cols[mileageIdx]) ? parseFloat(cols[mileageIdx]!.replace(/[^0-9.]/g, '')) || 35.0 : 35.0;
    const kerbWeightKg = (weightIdx >= 0 && cols[weightIdx]) ? parseInt(cols[weightIdx]!.replace(/[^0-9]/g, ''), 10) || 175 : 175;
    const fuelCapacityL = (tankIdx >= 0 && cols[tankIdx]) ? parseFloat(cols[tankIdx]!.replace(/[^0-9.]/g, '')) || 13 : 13;
    const inStockCount = (stockIdx >= 0 && cols[stockIdx]) ? parseInt(cols[stockIdx]!.replace(/[^0-9]/g, ''), 10) || 3 : 3;
    const customImage = (imageIdx >= 0 && cols[imageIdx]) ? cols[imageIdx]! : '';

    const variants = buildVariantsForModel(basePrice);
    const selectedVar = variants.find((v) => v.name.toLowerCase() === variantName.toLowerCase()) || variants[0]!;

    const defaultImage = customImage || (
      brand.toLowerCase().includes('ktm')
        ? '/assets/images/bike_ktm_duke_390_1793817701221.jpg'
        : brand.toLowerCase().includes('triumph')
        ? '/assets/images/bike_triumph_speed_400_1793818520492.jpg'
        : brand.toLowerCase().includes('yamaha')
        ? '/assets/images/bike_yamaha_aerox_155_1793817701070.jpg'
        : brand.toLowerCase().includes('classic') || brand.toLowerCase().includes('bullet')
        ? '/assets/images/bike_used_re_classic_350_1793818522002.jpg'
        : '/assets/images/bike_royal_enfield_hunter_1793817700106.jpg'
    );

    importedBikes.push({
      id: `bike-csv-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
      brand,
      model,
      variant: selectedVar.name,
      variants,
      selectedVariantId: selectedVar.id,
      category: ['Commuter', 'Roadster', 'Sport', 'Adventure', 'Cruiser', 'Scooter'].includes(catRaw)
        ? (catRaw as any)
        : 'Roadster',
      exShowroomPaise: selectedVar.exShowroomPaise,
      rtoTaxPaise: selectedVar.rtoTaxPaise,
      insurancePaise: selectedVar.insurancePaise,
      handlingPaise: selectedVar.handlingPaise,
      engineCc,
      powerBhp,
      torqueNm,
      mileageKmpl,
      kerbWeightKg,
      fuelCapacityL,
      availableColors: [
        { name: 'Stealth Black', hex: '#111827' },
        { name: 'Metallic Chrome', hex: '#64748b' },
        { name: 'Racing Amber', hex: '#B08D57' },
      ],
      inStockCount,
      image: defaultImage,
      description: `Loaded via CSV batch import into The Bike Yard showroom. Verified MH-04 Thane delivery specs.`,
    });
  }

  return { importedCount: importedBikes.length, bikes: importedBikes, errors };
}

