// Affiliate link configuration
// Educational approach - neutral listings

export type Casino = 'privateclub' | 'barbossabet';
export type Locale = 'en' | 'fr';

function envOrDefault(key: string, fallback: string): string {
  const value = import.meta.env?.[key];
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

export const AFFILIATE_LINKS: Record<Casino, Record<Locale, string>> = {
  privateclub: {
    en: envOrDefault(
      'AFFILIATE_PRIVATECLUB_EN',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=3&affiliateId=21',
    ),
    fr: envOrDefault(
      'AFFILIATE_PRIVATECLUB_FR',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=5&affiliateId=21',
    ),
  },
  barbossabet: {
    en: envOrDefault(
      'AFFILIATE_BARBOSSABET_EN',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=6&affiliateId=21',
    ),
    fr: envOrDefault(
      'AFFILIATE_BARBOSSABET_FR',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=7&affiliateId=21',
    ),
  },
} as const;

export const CASINO_INFO: Record<
  Casino,
  {
    name: string;
    description: Record<Locale, string>;
    features: Record<Locale, string[]>;
    color: string;
  }
> = {
  privateclub: {
    name: 'Private Club Casino',
    description: {
      en: 'Slots and live-casino categories are featured on the site.',
      fr: 'Le site met en avant des categories slots et casino live.',
    },
    features: {
      en: ['Massive Library: Crash, Megaways, Live Dealers & Jackpots', 'Anonymous & Crypto-First: Review withdrawal speeds and KYC terms', 'Unrestricted Play: Always verify local jurisdiction laws'],
      fr: ['Bibliotheque Massive : Crash, Megaways, Croupiers en Direct & Jackpots', 'Anonyme & Oriente Crypto : Verifiez les vitesses de retrait et conditions KYC', 'Jeu Sans Restriction : Verifiez toujours les lois de votre juridiction locale'],
    },
    color: 'from-dark-800 to-dark-900',
  },
  barbossabet: {
    name: 'BarbossaBet',
    description: {
      en: 'Casino lobby categories are highlighted on the site.',
      fr: 'Le site met en avant des categories de lobby casino.',
    },
    features: {
      en: ['The Classics & Beyond: Roulette, TV Games, Blackjack, and Megaways', 'High-Limit Tables: Check maximum bet sizes and payout terms', 'Offshore Registration: Verify access and legality in your region'],
      fr: ['Les Classiques et Plus : Roulette, Jeux Televises, Blackjack, et Megaways', 'Tables a Hautes Limites : Verifiez les mises maximales et termes de paiement', 'Inscription Offshore : Verifiez l`acces et la legalite dans votre region'],
    },
    color: 'from-blue-500 to-cyan-500',
  },
} as const;

export function getAffiliateLink(casino: Casino = 'privateclub', locale: Locale = 'en'): string {
  return AFFILIATE_LINKS[casino][locale];
}

export const CTA_TEXT: Record<
  Locale,
  {
    tryDemo: string;
    learnMore: string;
    viewGuide: string;
    seeAvailability: string;
    whereToPlay: string;
    affiliateDisclosure: string;
  }
> = {
  en: {
    tryDemo: 'Try Demo',
    learnMore: 'Learn More',
    viewGuide: 'View Guide',
    seeAvailability: 'Visit Casino',
    whereToPlay: 'Where to Play',
    affiliateDisclosure: 'Some links may be commercial links.',
  },
  fr: {
    tryDemo: 'Essayer la demo',
    learnMore: 'En savoir plus',
    viewGuide: 'Voir le guide',
    seeAvailability: 'Visiter le casino',
    whereToPlay: 'Ou jouer',
    affiliateDisclosure: 'Certains liens peuvent etre des liens commerciaux.',
  },
};

export const NAV_TEXT: Record<
  Locale,
  {
    home: string;
    guides: string;
    tools: string;
    categories: string;
    allGuides: string;
    insights: string;
    slots: string;
    crashGames: string;
    liveCasino: string;
    tableGames: string;
    strategy: string;
  }
> = {
  en: {
    home: 'Home',
    guides: 'Guides',
    tools: 'Tools',
    categories: 'Categories',
    allGuides: 'All Guides',
    insights: 'Insights',
    slots: 'Slots',
    crashGames: 'Crash Games',
    liveCasino: 'Live Casino',
    tableGames: 'Table Games',
    strategy: 'Strategy Guides',
  },
  fr: {
    home: 'Accueil',
    guides: 'Guides',
    tools: 'Outils',
    categories: 'Categories',
    allGuides: 'Tous les guides',
    insights: 'Insights',
    slots: 'Machines a sous',
    crashGames: 'Jeux crash',
    liveCasino: 'Casino live',
    tableGames: 'Jeux de table',
    strategy: 'Guides de strategie',
  },
};

export const UI_TEXT: Record<
  Locale,
  {
    geoDisclaimer: string;
    educationalPurpose: string;
    affiliateDisclosure: string;
    whereToPlay: string;
    gameAvailability: string;
    availabilityNote: string;
    availabilityWarning: string;
    featured: string;
    latest: string;
    browseByCategory: string;
    exploreGuides: string;
    filterBy: string;
    all: string;
    viewAll: string;
    readMore: string;
    relatedGuides: string;
    youMightLike: string;
    footerTagline: string;
    quickLinks: string;
    legal: string;
    responsibleGambling: string;
    privacyPolicy: string;
    termsOfService: string;
    eighteenPlus: string;
    gambleResponsibly: string;
    notFinancialAdvice: string;
  }
> = {
  en: {
    geoDisclaimer: 'Gambling laws vary by country. This content is for informational purposes only.',
    educationalPurpose: 'This guide explains how the game works and where it can be played, subject to local laws.',
    affiliateDisclosure: 'Some links may be commercial links.',
    whereToPlay: 'Where to Play',
    gameAvailability: 'Game Availability',
    availabilityNote: 'Operator availability and game access vary by location. Check details before you proceed.',
    availabilityWarning: 'Warning: Availability varies by jurisdiction. Always check legality in your region.',
    featured: 'Featured',
    latest: 'Latest',
    browseByCategory: 'Browse by Category',
    exploreGuides: 'Explore our educational guides organized by game type',
    filterBy: 'Filter by:',
    all: 'All',
    viewAll: 'View All',
    readMore: 'Read More',
    relatedGuides: 'Related Guides',
    youMightLike: 'You might also like',
    footerTagline: 'Educational guides to online casino games. We explain how games work - no promises, no guarantees.',
    quickLinks: 'Quick Links',
    legal: 'Legal',
    responsibleGambling: 'Responsible Gambling',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
    eighteenPlus: '18+ Only.',
    gambleResponsibly: 'Gamble responsibly.',
    notFinancialAdvice: 'Not financial or gambling advice.',
  },
  fr: {
    geoDisclaimer: "Les lois sur les jeux d'argent varient selon les pays. Ce contenu est uniquement informatif.",
    educationalPurpose:
      "Ce guide explique comment fonctionne le jeu et ou il peut etre joue, sous reserve des lois locales.",
    affiliateDisclosure: 'Certains liens peuvent etre des liens commerciaux.',
    whereToPlay: 'Ou jouer',
    gameAvailability: 'Disponibilite du jeu',
    availabilityNote: 'La disponibilite des operateurs et des jeux varie selon la zone. Verifiez les details avant de continuer.',
    availabilityWarning: 'Avertissement : la disponibilite varie selon la juridiction. Verifiez la legalite dans votre region.',
    featured: 'En vedette',
    latest: 'Derniers',
    browseByCategory: 'Parcourir par categorie',
    exploreGuides: 'Explorez nos guides educatifs par type de jeu',
    filterBy: 'Filtrer par :',
    all: 'Tout',
    viewAll: 'Voir tout',
    readMore: 'Lire la suite',
    relatedGuides: 'Guides connexes',
    youMightLike: 'Vous aimerez peut-etre',
    footerTagline:
      'Guides educatifs sur les jeux de casino en ligne. Nous expliquons comment fonctionnent les jeux - sans promesses, sans garanties.',
    quickLinks: 'Liens rapides',
    legal: 'Legal',
    responsibleGambling: 'Jeu responsable',
    privacyPolicy: 'Politique de confidentialite',
    termsOfService: "Conditions d'utilisation",
    eighteenPlus: '18+ uniquement.',
    gambleResponsibly: 'Jouez de maniere responsable.',
    notFinancialAdvice: 'Pas un conseil financier ou de jeu.',
  },
};

export const CATEGORY_NAMES: Record<string, Record<Locale, string>> = {
  slots: { en: 'Slots', fr: 'Machines a sous' },
  'crash-games': { en: 'Crash Games', fr: 'Jeux crash' },
  'live-casino': { en: 'Live Casino', fr: 'Casino live' },
  'table-games': { en: 'Table Games', fr: 'Jeux de table' },
  strategy: { en: 'Strategy Guides', fr: 'Guides de strategie' },
  reviews: { en: 'Game Reviews', fr: 'Avis sur les jeux' },
};

export function getCategoryName(slug: string, locale: Locale): string {
  return CATEGORY_NAMES[slug]?.[locale] || slug;
}
