import { JobCategory, Location } from '../types';

export const SRI_LANKA_DISTRICTS: Location[] = [
  // Western Province
  { id: 'loc_colombo', name: 'Colombo', slug: 'colombo', province: 'Western Province', display_order: 1 },
  { id: 'loc_gampaha', name: 'Gampaha', slug: 'gampaha', province: 'Western Province', display_order: 2 },
  { id: 'loc_kalutara', name: 'Kalutara', slug: 'kalutara', province: 'Western Province', display_order: 3 },

  // Central Province
  { id: 'loc_kandy', name: 'Kandy', slug: 'kandy', province: 'Central Province', display_order: 4 },
  { id: 'loc_matale', name: 'Matale', slug: 'matale', province: 'Central Province', display_order: 5 },
  { id: 'loc_nuwara_eliya', name: 'Nuwara Eliya', slug: 'nuwara-eliya', province: 'Central Province', display_order: 6 },

  // Southern Province
  { id: 'loc_galle', name: 'Galle', slug: 'galle', province: 'Southern Province', display_order: 7 },
  { id: 'loc_matara', name: 'Matara', slug: 'matara', province: 'Southern Province', display_order: 8 },
  { id: 'loc_hambantota', name: 'Hambantota', slug: 'hambantota', province: 'Southern Province', display_order: 9 },

  // Northern Province
  { id: 'loc_jaffna', name: 'Jaffna', slug: 'jaffna', province: 'Northern Province', display_order: 10 },
  { id: 'loc_kilinochchi', name: 'Kilinochchi', slug: 'kilinochchi', province: 'Northern Province', display_order: 11 },
  { id: 'loc_mannar', name: 'Mannar', slug: 'mannar', province: 'Northern Province', display_order: 12 },
  { id: 'loc_vavuniya', name: 'Vavuniya', slug: 'vavuniya', province: 'Northern Province', display_order: 13 },
  { id: 'loc_mullaitivu', name: 'Mullaitivu', slug: 'mullaitivu', province: 'Northern Province', display_order: 14 },

  // Eastern Province
  { id: 'loc_batticaloa', name: 'Batticaloa', slug: 'batticaloa', province: 'Eastern Province', display_order: 15 },
  { id: 'loc_ampara', name: 'Ampara', slug: 'ampara', province: 'Eastern Province', display_order: 16 },
  { id: 'loc_trincomalee', name: 'Trincomalee', slug: 'trincomalee', province: 'Eastern Province', display_order: 17 },

  // North Western Province
  { id: 'loc_kurunegala', name: 'Kurunegala', slug: 'kurunegala', province: 'North Western Province', display_order: 18 },
  { id: 'loc_puttalam', name: 'Puttalam', slug: 'puttalam', province: 'North Western Province', display_order: 19 },

  // North Central Province
  { id: 'loc_anuradhapura', name: 'Anuradhapura', slug: 'anuradhapura', province: 'North Central Province', display_order: 20 },
  { id: 'loc_polonnaruwa', name: 'Polonnaruwa', slug: 'polonnaruwa', province: 'North Central Province', display_order: 21 },

  // Uva Province
  { id: 'loc_badulla', name: 'Badulla', slug: 'badulla', province: 'Uva Province', display_order: 22 },
  { id: 'loc_monaragala', name: 'Monaragala', slug: 'monaragala', province: 'Uva Province', display_order: 23 },

  // Sabaragamuwa Province
  { id: 'loc_ratnapura', name: 'Ratnapura', slug: 'ratnapura', province: 'Sabaragamuwa Province', display_order: 24 },
  { id: 'loc_kegalle', name: 'Kegalle', slug: 'kegalle', province: 'Sabaragamuwa Province', display_order: 25 },
];

export const INITIAL_CATEGORIES: JobCategory[] = [
  { id: 'cat_it', name: 'Software & IT', slug: 'software-it', icon: 'Code2', display_order: 1 },
  { id: 'cat_banking', name: 'Banking & Finance', slug: 'banking-finance', icon: 'Landmark', display_order: 2 },
  { id: 'cat_marketing', name: 'Marketing & Sales', slug: 'marketing-sales', icon: 'TrendingUp', display_order: 3 },
  { id: 'cat_accounting', name: 'Accounting & Auditing', slug: 'accounting-auditing', icon: 'Calculator', display_order: 4 },
  { id: 'cat_logistics', name: 'Logistics & Supply Chain', slug: 'logistics-supply-chain', icon: 'Truck', display_order: 5 },
  { id: 'cat_support', name: 'Customer Service & BPO', slug: 'customer-service-bpo', icon: 'Headphones', display_order: 6 },
  { id: 'cat_tourism', name: 'Hospitality & Tourism', slug: 'hospitality-tourism', icon: 'Hotel', display_order: 7 },
  { id: 'cat_engineering', name: 'Engineering & Construction', slug: 'engineering-construction', icon: 'Wrench', display_order: 8 },
  { id: 'cat_healthcare', name: 'Healthcare & Medical', slug: 'healthcare-medical', icon: 'Stethoscope', display_order: 9 },
  { id: 'cat_management', name: 'HR & Administration', slug: 'hr-administration', icon: 'Users', display_order: 10 },
];

const nowIso = new Date().toISOString();


