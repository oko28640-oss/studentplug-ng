import { Product, Institution, ProductCategory, ServiceCategory } from '../types';

/**
 * Sanitizes user search input to prevent injection, strip dangerous characters,
 * and limit length.
 */
export function sanitizeSearchInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>'"`;(){}[\]\\]/g, ' ') // Strip special scripting syntax
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

// Synonyms / related keywords for common campus searches
const CAMPUS_SEARCH_SYNONYMS: Record<string, string[]> = {
  perfume: ['perfumes', 'fragrance', 'oud', 'oil', 'body mist', 'scent', 'lattafa', 'cologne'],
  shoes: ['sneakers', 'slides', 'crocs', 'boots', 'heels', 'footwear', 'air force', 'sandals'],
  phone: ['phones', 'iphone', 'samsung', 'android', 'repair', 'charger', 'power bank', 'screen', 'screen guard'],
  textbook: ['textbooks', 'book', 'books', 'handout', 'handouts', 'past question', 'past questions', 'notes', 'study material'],
  wig: ['wigs', 'hair', 'bone straight', 'frontal', 'closure', 'braids', 'curls'],
  hair: ['hair styling', 'wigs', 'braiding', 'braids', 'knotless', 'wig revamping', 'hair vendors', 'barbing', 'haircuts'],
  food: ['snacks', 'meal', 'jollof', 'chinchin', 'chicken', 'small chops', 'catering', 'bites'],
  laptop: ['laptops', 'computer', 'hp', 'dell', 'macbook', 'charger', 'notebook', 'pc'],
  graphics: ['graphic', 'graphic design', 'flyer', 'flyers', 'logo', 'typesetting', 'slides', 'poster'],
  graphic: ['graphics', 'graphic design', 'flyer', 'flyers', 'logo', 'typesetting', 'slides', 'poster'],
};

/**
 * Extract live suggestions for typed text.
 */
export function getLiveSuggestions(
  query: string,
  products: Product[],
  categories: { name: ProductCategory }[],
  servicesCategories: { name: string }[]
): string[] {
  const clean = sanitizeSearchInput(query).toLowerCase();
  if (!clean || clean.length < 2) return [];

  const suggestions = new Set<string>();

  // 1. Direct category matches
  for (const cat of categories) {
    if (cat.name.toLowerCase().includes(clean)) {
      suggestions.add(cat.name);
    }
  }

  // 2. Direct service category matches
  for (const s of servicesCategories) {
    if (s.name.toLowerCase().includes(clean)) {
      suggestions.add(s.name);
    }
  }

  // 3. Synonym matches (e.g. "per" -> "Perfume", "Perfume oil", "Personalized perfume")
  if (clean.startsWith('per')) {
    suggestions.add('Perfumes');
    suggestions.add('Perfume oil');
    suggestions.add('Personalized perfume');
    suggestions.add('Perfume gift set');
  }

  if (clean.startsWith('sho') || clean.startsWith('sne')) {
    suggestions.add('Shoes & Bags');
    suggestions.add('Sneakers');
    suggestions.add('Campus slides & Crocs');
  }

  if (clean.startsWith('hai') || clean.startsWith('bra')) {
    suggestions.add('Hair & Wigs');
    suggestions.add('Hair styling');
    suggestions.add('Knotless braids');
    suggestions.add('Wig revamping');
  }

  if (clean.startsWith('pho')) {
    suggestions.add('Phones & Accessories');
    suggestions.add('Phone repair');
    suggestions.add('Power bank');
    suggestions.add('iPhone 11');
  }

  if (clean.startsWith('text') || clean.startsWith('boo') || clean.startsWith('han')) {
    suggestions.add('Books & School Materials');
    suggestions.add('Nursing textbooks');
    suggestions.add('GST past questions');
  }

  if (clean.startsWith('foo') || clean.startsWith('sna') || clean.startsWith('jol')) {
    suggestions.add('Food & Snacks');
    suggestions.add('Hostel jollof rice');
    suggestions.add('Crunchy chinchin');
  }

  if (clean.startsWith('graph') || clean.startsWith('fly')) {
    suggestions.add('Graphic design');
    suggestions.add('Flyer & poster design');
    suggestions.add('Assignment typesetting');
  }

  // 4. Product titles matching
  for (const prod of products) {
    if (prod.status === 'removed') continue;
    const titleLower = prod.title.toLowerCase();
    if (titleLower.includes(clean)) {
      // Shorten long titles to a concise suggestion phrase
      if (prod.title.length <= 40) {
        suggestions.add(prod.title);
      } else {
        const words = prod.title.split(' ').slice(0, 5).join(' ');
        suggestions.add(words);
      }
    }
    if (suggestions.size >= 8) break;
  }

  return Array.from(suggestions).slice(0, 7);
}

export interface SearchFilterOptions {
  category: string;
  school: string;
  condition: 'All' | 'New' | 'Used';
  itemType: 'all' | 'product' | 'service';
  minPrice: string | number;
  maxPrice: string | number;
  sortBy: 'relevant' | 'recent' | 'price_asc' | 'price_desc' | 'popular';
  campusScope: 'my_campus' | 'all';
  userSchool: string;
}

/**
 * Filter and sort products according to search query and active filter options.
 * Excludes private information (matric numbers, private phone numbers, messages).
 */
export function searchMarketplace(
  rawQuery: string,
  products: Product[],
  filters: SearchFilterOptions
): Product[] {
  const cleanQuery = sanitizeSearchInput(rawQuery).toLowerCase();
  const searchTokens = cleanQuery.split(' ').filter(Boolean);

  // Expand query tokens with synonyms if applicable
  const expandedTokens = new Set<string>(searchTokens);
  for (const token of searchTokens) {
    if (CAMPUS_SEARCH_SYNONYMS[token]) {
      CAMPUS_SEARCH_SYNONYMS[token].forEach(syn => expandedTokens.add(syn.toLowerCase()));
    }
  }

  const results = products.filter((item) => {
    // Exclude removed products
    if (item.status === 'removed') return false;

    // 1. Text Search matching
    if (searchTokens.length > 0) {
      // Build safe public searchable text blob
      const publicSearchBlob = [
        item.title,
        item.description,
        item.category,
        item.serviceCategory || '',
        item.itemType || '',
        item.sellerName,
        item.sellerSchool,
        item.sellerCampus,
        item.locationDetails,
      ].join(' ').toLowerCase();

      // Check if at least one token or direct query matches
      const directMatch = publicSearchBlob.includes(cleanQuery);
      if (!directMatch) {
        const allTokensMatch = searchTokens.every(tok => 
          publicSearchBlob.includes(tok) || 
          Array.from(expandedTokens).some(exp => publicSearchBlob.includes(exp))
        );
        if (!allTokensMatch) return false;
      }
    }

    // 2. Campus Scope Filter
    if (filters.campusScope === 'my_campus') {
      const targetSchool = filters.school !== 'All' ? filters.school : filters.userSchool;
      if (item.sellerSchool.toLowerCase() !== targetSchool.toLowerCase()) {
        return false;
      }
    } else if (filters.school !== 'All') {
      if (item.sellerSchool.toLowerCase() !== filters.school.toLowerCase()) {
        return false;
      }
    }

    // 3. Category Filter
    if (filters.category !== 'All' && item.category !== filters.category) {
      return false;
    }

    // 4. Condition Filter
    if (filters.condition !== 'All' && item.condition !== filters.condition) {
      return false;
    }

    // 5. Item Type Filter (Product vs Service)
    if (filters.itemType === 'service' && item.itemType !== 'service') {
      return false;
    }
    if (filters.itemType === 'product' && item.itemType === 'service') {
      return false;
    }

    // 6. Price Range Filter
    const activePrice = (item.isDeal && item.discountPrice) ? item.discountPrice : item.price;
    const min = typeof filters.minPrice === 'string' ? parseFloat(filters.minPrice) : filters.minPrice;
    const max = typeof filters.maxPrice === 'string' ? parseFloat(filters.maxPrice) : filters.maxPrice;

    if (!isNaN(min) && min > 0 && activePrice < min) {
      return false;
    }
    if (!isNaN(max) && max > 0 && activePrice > max) {
      return false;
    }

    return true;
  });

  // Sort Results
  return results.sort((a, b) => {
    // In 'relevant' mode, prioritize listings from user's school
    if (filters.sortBy === 'relevant') {
      const aIsUserSchool = a.sellerSchool.toLowerCase() === filters.userSchool.toLowerCase();
      const bIsUserSchool = b.sellerSchool.toLowerCase() === filters.userSchool.toLowerCase();
      if (aIsUserSchool && !bIsUserSchool) return -1;
      if (!aIsUserSchool && bIsUserSchool) return 1;

      // Promoted / Featured listings second priority
      if ((a.isPromoted || a.isFeatured) && !(b.isPromoted || b.isFeatured)) return -1;
      if (!(a.isPromoted || a.isFeatured) && (b.isPromoted || b.isFeatured)) return 1;
      return 0;
    }

    if (filters.sortBy === 'price_asc') {
      const priceA = (a.isDeal && a.discountPrice) ? a.discountPrice : a.price;
      const priceB = (b.isDeal && b.discountPrice) ? b.discountPrice : b.price;
      return priceA - priceB;
    }

    if (filters.sortBy === 'price_desc') {
      const priceA = (a.isDeal && a.discountPrice) ? a.discountPrice : a.price;
      const priceB = (b.isDeal && b.discountPrice) ? b.discountPrice : b.price;
      return priceB - priceA;
    }

    if (filters.sortBy === 'popular') {
      return (b.viewsCount + b.favouritesCount * 3) - (a.viewsCount + a.favouritesCount * 3);
    }

    // 'recent' by default
    return (b.isPromoted ? 1 : 0) - (a.isPromoted ? 1 : 0);
  });
}
