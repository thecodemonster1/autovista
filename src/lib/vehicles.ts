/**
 * Curated vehicle listings for the marketplace.
 *
 * Brands, models and prices mirror the training dataset so that predicted
 * prices are directly comparable with advertised prices. In a production
 * system this module would be replaced by a database query layer with the
 * same function signatures.
 */
import type { Vehicle } from './types';

const VEHICLES: Vehicle[] = [
  {
    id: 'av-001',
    title: 'Honda Vezel Z Grade 2018',
    brand: 'Honda',
    model: 'Vezel',
    year: 2018,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    engineCc: 1500,
    mileageKm: 68_000,
    bodyType: 'Crossover',
    colour: 'Pearl White',
    location: 'Colombo',
    price: 13_750_000,
    description:
      'Z Grade with sensing package, full service history from the agent, and a fresh hybrid battery health report. Two previous owners, accident-free.',
    featured: true,
    sellerType: 'Dealer',
    postedAt: '2026-07-02',
  },
  {
    id: 'av-002',
    title: 'Toyota Raize Z Turbo 2022',
    brand: 'Toyota',
    model: 'Raize',
    year: 2022,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCc: 1000,
    mileageKm: 24_500,
    bodyType: 'Crossover',
    colour: 'Turquoise Metallic',
    location: 'Gampaha',
    price: 11_900_000,
    description:
      'Top-of-the-range Z grade with the 1.0 turbo engine, panoramic view monitor and smart assist. Maintained exclusively at Toyota Lanka.',
    featured: true,
    sellerType: 'Private seller',
    postedAt: '2026-07-05',
  },
  {
    id: 'av-003',
    title: 'Suzuki Wagon R FZ Safety 2017',
    brand: 'Suzuki',
    model: 'Wagon R',
    year: 2017,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    engineCc: 660,
    mileageKm: 82_000,
    bodyType: 'Hatchback',
    colour: 'Blue',
    location: 'Kandy',
    price: 6_150_000,
    description:
      'FZ Safety grade with radar brake support and energy-saving mild hybrid system. Economical daily runner with new tyres fitted this year.',
    featured: false,
    sellerType: 'Private seller',
    postedAt: '2026-06-28',
  },
  {
    id: 'av-004',
    title: 'Toyota Land Cruiser Prado TX 2015',
    brand: 'Toyota',
    model: 'Land Cruiser Prado',
    year: 2015,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Diesel',
    engineCc: 2800,
    mileageKm: 112_000,
    bodyType: 'SUV',
    colour: 'Black',
    location: 'Colombo',
    price: 29_500_000,
    description:
      'TX grade 2.8 diesel with sunroof, cool box and rear entertainment. Company-maintained with complete records; genuine mileage certified.',
    featured: true,
    sellerType: 'Dealer',
    postedAt: '2026-06-30',
  },
  {
    id: 'av-005',
    title: 'Toyota Aqua G Grade 2015',
    brand: 'Toyota',
    model: 'Aqua',
    year: 2015,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    engineCc: 1500,
    mileageKm: 95_000,
    bodyType: 'Hatchback',
    colour: 'Silver',
    location: 'Kurunegala',
    price: 8_200_000,
    description:
      'G grade with push start, dual multimedia and reversing camera. Hybrid system serviced regularly; superb fuel economy in town.',
    featured: true,
    sellerType: 'Private seller',
    postedAt: '2026-07-01',
  },
  {
    id: 'av-006',
    title: 'Suzuki Alto K10 2015',
    brand: 'Suzuki',
    model: 'Alto',
    year: 2015,
    condition: 'Used',
    transmission: 'Manual',
    fuelType: 'Petrol',
    engineCc: 1000,
    mileageKm: 76_000,
    bodyType: 'Hatchback',
    colour: 'Red',
    location: 'Galle',
    price: 4_950_000,
    description:
      'K10 with air conditioning and power steering. First-owner vehicle with clean documentation — ideal budget-friendly first car.',
    featured: false,
    sellerType: 'Private seller',
    postedAt: '2026-06-25',
  },
  {
    id: 'av-007',
    title: 'Toyota Yaris G Grade 2019',
    brand: 'Toyota',
    model: 'Yaris',
    year: 2019,
    condition: 'Used',
    transmission: 'CVT',
    fuelType: 'Petrol',
    engineCc: 1500,
    mileageKm: 45_000,
    bodyType: 'Hatchback',
    colour: 'Crimson Red',
    location: 'Negombo',
    price: 10_500_000,
    description:
      'G grade with seven airbags, cruise control and touchscreen infotainment. Lady-driven and garage-kept since new.',
    featured: false,
    sellerType: 'Dealer',
    postedAt: '2026-07-04',
  },
  {
    id: 'av-008',
    title: 'Daihatsu Mira X SA III 2018',
    brand: 'Daihatsu',
    model: 'Mira',
    year: 2018,
    condition: 'Reconditioned',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCc: 660,
    mileageKm: 51_000,
    bodyType: 'Hatchback',
    colour: 'White',
    location: 'Matara',
    price: 7_050_000,
    description:
      'Freshly imported auction grade 4.5 unit with smart assist III collision avoidance. Outstanding economy at over 20 km/l.',
    featured: false,
    sellerType: 'Dealer',
    postedAt: '2026-07-06',
  },
  {
    id: 'av-009',
    title: 'Mercedes Benz C200 AMG Line 2018',
    brand: 'Mercedes Benz',
    model: 'C200',
    year: 2018,
    condition: 'Used',
    transmission: 'Tiptronic',
    fuelType: 'Petrol',
    engineCc: 2000,
    mileageKm: 58_000,
    bodyType: 'Sedan',
    colour: 'Obsidian Black',
    location: 'Colombo',
    price: 26_500_000,
    description:
      'AMG Line with premium plus package, burmester sound and 360° camera. Agent-maintained with all records available for inspection.',
    featured: true,
    sellerType: 'Dealer',
    postedAt: '2026-07-03',
  },
  {
    id: 'av-010',
    title: 'BYD Atto 3 Extended Range 2023',
    brand: 'BYD',
    model: 'ATTO 3',
    year: 2023,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Electric',
    engineCc: 150,
    mileageKm: 18_000,
    bodyType: 'SUV',
    colour: 'Surf Blue',
    location: 'Colombo',
    price: 15_500_000,
    description:
      'Extended range variant with 420 km real-world range, vehicle-to-load support and remaining manufacturer warranty. Home-charged from new.',
    featured: true,
    sellerType: 'Private seller',
    postedAt: '2026-07-07',
  },
  {
    id: 'av-011',
    title: 'Kia Sonet GT Line 2023',
    brand: 'Kia',
    model: 'Sonet',
    year: 2023,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCc: 1500,
    mileageKm: 21_000,
    bodyType: 'Crossover',
    colour: 'Intense Red',
    location: 'Kadawatha',
    price: 12_400_000,
    description:
      'GT Line with ventilated seats, Bose audio and sunroof. Balance manufacturer warranty until 2028 transfers to the new owner.',
    featured: false,
    sellerType: 'Dealer',
    postedAt: '2026-07-08',
  },
  {
    id: 'av-012',
    title: 'Toyota Corolla 121 G Grade 2005',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2005,
    condition: 'Used',
    transmission: 'Automatic',
    fuelType: 'Petrol',
    engineCc: 1500,
    mileageKm: 168_000,
    bodyType: 'Sedan',
    colour: 'Champagne Gold',
    location: 'Kegalle',
    price: 6_750_000,
    description:
      'Legendary 121 platform in exceptional condition for its age. Recent full service, new battery and well-documented ownership history.',
    featured: false,
    sellerType: 'Private seller',
    postedAt: '2026-06-22',
  },
];

/** All listings, newest first. */
export function getAllVehicles(): Vehicle[] {
  return [...VEHICLES].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

/** Look up a single listing by its identifier. */
export function getVehicleById(id: string): Vehicle | undefined {
  return VEHICLES.find((vehicle) => vehicle.id === id);
}

/** Listings highlighted in the home-page carousel. */
export function getFeaturedVehicles(): Vehicle[] {
  return VEHICLES.filter((vehicle) => vehicle.featured);
}

/** Distinct brands present in the catalogue, alphabetically. */
export function getCatalogueBrands(): string[] {
  return [...new Set(VEHICLES.map((vehicle) => vehicle.brand))].sort();
}
