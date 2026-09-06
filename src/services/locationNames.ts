import { Language } from './i18n';

// Dictionary of District names
export const DISTRICT_NAMES: Record<string, Record<Language, string>> = {
  'North 24 Parganas': {
    en: 'North 24 Parganas',
    hi: 'उत्तर 24 परगना',
    bn: 'উত্তর ২৪ পরগনা',
  },
  'South 24 Parganas': {
    en: 'South 24 Parganas',
    hi: 'दक्षिण 24 परगना',
    bn: 'দক্ষিণ ২৪ পরগনা',
  },
  'Hooghly': {
    en: 'Hooghly',
    hi: 'हुगली',
    bn: 'হুগলি',
  },
  'Nadia': {
    en: 'Nadia',
    hi: 'नादिया',
    bn: 'নদীয়া',
  }
};

// Dictionary of Centre/City names
export const LOCATION_NAMES: Record<string, Record<Language, string>> = {
  'Barasat': {
    en: 'Barasat',
    hi: 'बारासात',
    bn: 'বারাসাত',
  },
  'Basirhat': {
    en: 'Basirhat',
    hi: 'बसीरहाट',
    bn: 'বসিরহাট',
  },
  'Bongaon': {
    en: 'Bongaon',
    hi: 'बनगांव',
    bn: 'বনগাঁ',
  },
  'Burdwan': {
    en: 'Burdwan',
    hi: 'बर्दवान',
    bn: 'বর্ধমান',
  },
  'Kalyani': {
    en: 'Kalyani',
    hi: 'कल्याणी',
    bn: 'কল্যাণী',
  },
  'Dankuni': {
    en: 'Dankuni',
    hi: 'दानकुनी',
    bn: 'ডানকুনি',
  }
};

/**
 * Helper to translate a location/district name safely.
 * Falls back to the original string if not found in the dictionary.
 */
export function tLocation(name: string, lang: Language, type: 'district' | 'city' = 'city'): string {
  const dict = type === 'district' ? DISTRICT_NAMES : LOCATION_NAMES;
  // If the exact match exists
  if (dict[name] && dict[name][lang]) {
    return dict[name][lang];
  }
  
  // Try case-insensitive matching
  const key = Object.keys(dict).find(k => k.toLowerCase() === name.toLowerCase());
  if (key && dict[key][lang]) {
    return dict[key][lang];
  }

  // Fallback to original string
  return name;
}
