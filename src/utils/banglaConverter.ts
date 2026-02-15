import bijoy2unicode from '@codesigntheory/bnbijoy2unicode';

// ===========================
// TYPE DEFINITIONS
// ===========================

export type ConversionMode = 'bijoy-to-unicode' | 'unicode-to-bijoy' | 'english-to-bangla';

interface PhoneticChar {
  independent: string;
  dependent: string;
}

// ===========================
// UNICODE TO BIJOY MAPPING
// ===========================

const UNICODE_TO_BIJOY_MAP: Record<string, string> = {
  // Vowels (Independent)
  'অ': 'A', 'আ': 'Av', 'ই': 'B', 'ঈ': 'C', 'উ': 'D', 'ঊ': 'E', 'ঋ': 'F', 
  'এ': 'G', 'ঐ': 'H', 'ও': 'I', 'ঔ': 'J',
  
  // Consonants
  'ক': 'K', 'খ': 'L', 'গ': 'M', 'ঘ': 'N', 'ঙ': 'O', 
  'চ': 'P', 'ছ': 'Q', 'জ': 'R', 'ঝ': 'S', 'ঞ': 'T',
  'ট': 'U', 'ঠ': 'V', 'ড': 'W', 'ঢ': 'X', 'ণ': 'Y', 
  'ত': 'Z', 'থ': '_', 'দ': '`', 'ধ': 'a', 'ন': 'b',
  'প': 'c', 'ফ': 'd', 'ব': 'e', 'ভ': 'f', 'ম': 'g', 
  'য': 'h', 'র': 'i', 'ল': 'j', 'শ': 'k', 'ষ': 'l',
  'স': 'm', 'হ': 'n', 'ড়': 'o', 'ঢ়': 'p', 'য়': 'q', 
  'ৎ': 'r', 'ং': 's', 'ঃ': 't', 'ঁ': 'u',
  
  // Vowel Marks (Kars)
  'া': 'v', 'ি': 'w', 'ী': 'x', 'ু': 'y', 'ূ': 'z', 
  'ৃ': '‡…', 'ে': '‡', 'ৈ': '‰', 'ো': '‡v', 'ৌ': '‡Š',
  
  // Numbers
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', 
  '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  
  // Common Conjuncts
  'ক্ষ': 'ÿ', 'জ্ঞ': 'Á',
};

// ===========================
// PHONETIC MAPPING (AVRO-STYLE)
// ===========================

const PHONETIC_MAP: Record<string, PhoneticChar> = {
  // Two-character consonants
  'kh': { independent: 'খ', dependent: '' },
  'gh': { independent: 'ঘ', dependent: '' },
  'ng': { independent: 'ঙ', dependent: '' },
  'ch': { independent: 'ছ', dependent: '' },
  'jh': { independent: 'ঝ', dependent: '' },
  'th': { independent: 'ঠ', dependent: '' },
  'dh': { independent: 'ধ', dependent: '' },
  'ph': { independent: 'ফ', dependent: '' },
  'bh': { independent: 'ভ', dependent: '' },
  'sh': { independent: 'শ', dependent: '' },
  
  // Single consonants
  'k': { independent: 'ক', dependent: '' },
  'g': { independent: 'গ', dependent: '' },
  'c': { independent: 'চ', dependent: '' },
  'j': { independent: 'জ', dependent: '' },
  't': { independent: 'ত', dependent: '' },
  'd': { independent: 'দ', dependent: '' },
  'n': { independent: 'ন', dependent: '' },
  'p': { independent: 'প', dependent: '' },
  'f': { independent: 'ফ', dependent: '' },
  'b': { independent: 'ব', dependent: '' },
  'm': { independent: 'ম', dependent: '' },
  'z': { independent: 'য', dependent: '' },
  'r': { independent: 'র', dependent: '' },
  'l': { independent: 'ল', dependent: '' },
  's': { independent: 'স', dependent: '' },
  'h': { independent: 'হ', dependent: '' },
  
  // Two-character vowels/dipthongs
  'oi': { independent: 'ঐ', dependent: 'ৈ' },
  'ou': { independent: 'ঔ', dependent: 'ৌ' },
  
  // Single vowels
  'a': { independent: 'আ', dependent: 'া' },
  'o': { independent: 'অ', dependent: '' },
  'i': { independent: 'ই', dependent: 'ি' },
  'I': { independent: 'ঈ', dependent: 'ী' },
  'u': { independent: 'উ', dependent: 'ু' },
  'U': { independent: 'ঊ', dependent: 'ূ' },
  'e': { independent: 'এ', dependent: 'ে' },
  'O': { independent: 'ও', dependent: 'ো' },
};

// Pre-base vowels that appear before consonants in Bijoy visual ordering
const PRE_BASE_VOWELS = ['ি', 'ে', 'ৈ'];

// Vowel characters for phonetic detection
const VOWEL_CHARS = ['a', 'i', 'u', 'e', 'o'];

// ===========================
// CONVERSION FUNCTIONS
// ===========================

/**
 * Convert Bijoy (ANSI) text to Unicode Bangla
 */
export const convertBijoyToUnicode = (text: string): string => {
  if (!text?.trim()) return '';
  
  try {
    return bijoy2unicode(text);
  } catch (error) {
    console.error('Bijoy to Unicode conversion error:', error);
    return text;
  }
};

/**
 * Convert Unicode Bangla to Bijoy (ANSI) with proper visual reordering
 */
export const convertUnicodeToBijoy = (text: string): string => {
  if (!text?.trim()) return '';
  
  try {
    let result = '';
    const chars = Array.from(text);

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      const bijoyChar = UNICODE_TO_BIJOY_MAP[char] || char;

      // Handle pre-base vowels reordering (visual ordering for Bijoy)
      if (PRE_BASE_VOWELS.includes(char) && result.length > 0) {
        const prevChar = result.slice(-1);
        result = result.slice(0, -1);
        result += bijoyChar + prevChar;
      } else {
        result += bijoyChar;
      }
    }

    return result;
  } catch (error) {
    console.error('Unicode to Bijoy conversion error:', error);
    return text;
  }
};

/**
 * Convert English phonetic text to Bangla (Avro-style)
 * Handles kar vs independent vowel logic
 */
export const convertEnglishToBangla = (text: string): string => {
  if (!text?.trim()) return '';
  
  try {
    let result = '';
    let i = 0;

    while (i < text.length) {
      let matched = false;
      let matchLength = 0;
      let charData: PhoneticChar | null = null;

      // Try 2-character patterns first (e.g., 'kh', 'sh', 'oi')
      if (i + 1 < text.length) {
        const twoChar = text.substring(i, i + 2).toLowerCase();
        if (PHONETIC_MAP[twoChar]) {
          charData = PHONETIC_MAP[twoChar];
          matchLength = 2;
          matched = true;
        }
      }

      // Try single character if no 2-char match
      if (!matched) {
        const oneChar = text[i].toLowerCase();
        if (PHONETIC_MAP[oneChar]) {
          charData = PHONETIC_MAP[oneChar];
          matchLength = 1;
          matched = true;
        }
      }

      if (matched && charData) {
        const isVowel = VOWEL_CHARS.includes(text[i].toLowerCase());
        
        if (isVowel) {
          // Check if previous character is a Bangla consonant
          const lastChar = result.slice(-1);
          const isAfterConsonant = lastChar >= 'ক' && lastChar <= 'হ';
          
          result += isAfterConsonant ? charData.dependent : charData.independent;
        } else {
          result += charData.independent;
        }
        
        i += matchLength;
      } else {
        // No match, keep original character
        result += text[i];
        i++;
      }
    }

    return result;
  } catch (error) {
    console.error('English to Bangla conversion error:', error);
    return text;
  }
};

/**
 * Main conversion function - routes to appropriate converter
 * Uses backend API for Bijoy conversions, client-side for phonetic
 */
export const convertText = async (text: string, mode: ConversionMode): Promise<string> => {
  if (!text?.trim()) return '';

  // Use backend API for Bijoy conversions (high-performance package)
  if (mode === 'bijoy-to-unicode' || mode === 'unicode-to-bijoy') {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000';
      const response = await fetch(`${baseUrl}/api/bangla/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Conversion failed');
      }

      return data.data.convertedText;
    } catch (error) {
      console.error('Backend conversion error:', error);
      // Fallback to client-side conversion
      if (mode === 'bijoy-to-unicode') {
        return convertBijoyToUnicode(text);
      } else {
        return convertUnicodeToBijoy(text);
      }
    }
  }

  // Use client-side for English-to-Bangla phonetic
  if (mode === 'english-to-bangla') {
    return convertEnglishToBangla(text);
  }

  return text;
};