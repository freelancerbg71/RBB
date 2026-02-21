// Affiliate link configuration
// Educational approach - neutral listings

export type Casino = 'privateclub' | 'barbossabet';
export type Locale = 'en' | 'fr' | 'de' | 'ru';

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
    de: envOrDefault(
      'AFFILIATE_PRIVATECLUB_DE',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=3&affiliateId=21',
    ),
    ru: envOrDefault(
      'AFFILIATE_PRIVATECLUB_RU',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=3&affiliateId=21',
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
    de: envOrDefault(
      'AFFILIATE_BARBOSSABET_DE',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=6&affiliateId=21',
    ),
    ru: envOrDefault(
      'AFFILIATE_BARBOSSABET_RU',
      'https://affiliates.7seasaffiliates.com/workspaces/api/tracking-links/record?trackingLinkId=6&affiliateId=21',
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
      de: 'Slots und Live-Casino-Kategorien werden auf der Website vorgestellt. Deutsche Benutzeroberfläche verfügbar.',
      ru: 'На сайте представлены категории слотов и лайв-казино.',
    },
    features: {
      en: ['Massive Library: Crash, Megaways, Live Dealers & Jackpots', 'Anonymous & Crypto-First: Review withdrawal speeds and KYC terms', 'Unrestricted Play: Always verify local jurisdiction laws'],
      fr: ['Bibliotheque Massive : Crash, Megaways, Croupiers en Direct & Jackpots', 'Anonyme & Oriente Crypto : Verifiez les vitesses de retrait et conditions KYC', 'Jeu Sans Restriction : Verifiez toujours les lois de votre juridiction locale'],
      de: ['Riesige Bibliothek: Crash, Megaways, Live-Dealer & Jackpots', 'Anonym & Krypto-Erste: Überprüfen Sie Auszahlungsgeschwindigkeiten und KYC-Bedingungen', 'Uneingeschränktes Spielen: Überprüfen Sie immer die lokalen Gerichtsbarkeitsgesetze'],
      ru: ['Огромная библиотека: Crash, Megaways, живые дилеры и джекпоты', 'Анонимно и Крипто: проверьте скорость вывода и условия KYC', 'Игра без ограничений: Всегда проверяйте местные законы'],
    },
    color: 'from-dark-800 to-dark-900',
  },
  barbossabet: {
    name: 'BarbossaBet',
    description: {
      en: 'Casino lobby categories are highlighted on the site.',
      fr: 'Le site met en avant des categories de lobby casino.',
      de: 'Casino-Lobby-Kategorien werden auf der Website hervorgehoben.',
      ru: 'На сайте выделены категории лобби казино.',
    },
    features: {
      en: ['The Classics & Beyond: Roulette, TV Games, Blackjack, and Megaways', 'High-Limit Tables: Check maximum bet sizes and payout terms', 'Offshore Registration: Verify access and legality in your region'],
      fr: ['Les Classiques et Plus : Roulette, Jeux Televises, Blackjack, et Megaways', 'Tables a Hautes Limites : Verifiez les mises maximales et termes de paiement', 'Inscription Offshore : Verifiez l`acces et la legalite dans votre region'],
      de: ['Die Klassiker & Mehr: Roulette, TV-Spiele, Blackjack und Megaways', 'High-Limit-Tische: Überprüfen Sie maximale Einsatzhöhen und Auszahlungsbedingungen', 'Offshore-Registrierung: Überprüfen Sie Zugang und Legalität in Ihrer Region'],
      ru: ['Классика и не только: рулетка, ТВ-игры, блэкджек и Megaways', 'Столы с высокими лимитами: проверьте максимальные ставки и условия выплат', 'Офшорная регистрация: проверьте доступ и легальность в вашем регионе'],
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
  de: {
    tryDemo: 'Demo testen',
    learnMore: 'Mehr erfahren',
    viewGuide: 'Anleitung ansehen',
    seeAvailability: 'Casino besuchen',
    whereToPlay: 'Wo man spielen kann',
    affiliateDisclosure: 'Einige Links können Werbelinks sein.',
  },
  ru: {
    tryDemo: 'Попробовать демо',
    learnMore: 'Узнать больше',
    viewGuide: 'Смотреть руководство',
    seeAvailability: 'Посетить казино',
    whereToPlay: 'Где играть',
    affiliateDisclosure: 'Некоторые ссылки могут быть рекламными.',
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
  de: {
    home: 'Startseite',
    guides: 'Anleitungen',
    tools: 'Werkzeuge',
    categories: 'Kategorien',
    allGuides: 'Alle Anleitungen',
    insights: 'Einblicke',
    slots: 'Spielautomaten',
    crashGames: 'Crash-Spiele',
    liveCasino: 'Live-Casino',
    tableGames: 'Tischspiele',
    strategy: 'Strategie-Anleitungen',
  },
  ru: {
    home: 'Главная',
    guides: 'Руководства',
    tools: 'Инструменты',
    categories: 'Категории',
    allGuides: 'Все руководства',
    insights: 'Аналитика',
    slots: 'Слоты',
    crashGames: 'Краш-игры',
    liveCasino: 'Лайв-казино',
    tableGames: 'Настольные игры',
    strategy: 'Руководства по стратегиям',
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
  de: {
    geoDisclaimer: 'Glücksspielgesetze variieren je nach Land. Dieser Inhalt dient nur zu Informationszwecken.',
    educationalPurpose: 'Dieser Leitfaden erklärt, wie das Spiel funktioniert und wo es gespielt werden kann (vorbehaltlich lokaler Gesetze).',
    affiliateDisclosure: 'Einige Links können Werbelinks sein.',
    whereToPlay: 'Wo man spielen kann',
    gameAvailability: 'Spielverfügbarkeit',
    availabilityNote: 'Die Verfügbarkeit von Betreibern und der Spielzugang variieren je nach Standort. Überprüfen Sie die Details, bevor Sie fortfahren.',
    availabilityWarning: 'Warnung: Die Verfügbarkeit variiert je nach Gerichtsbarkeit. Überprüfen Sie immer die Legalität in Ihrer Region.',
    featured: 'Empfohlen',
    latest: 'Neueste',
    browseByCategory: 'Nach Kategorie durchsuchen',
    exploreGuides: 'Entdecken Sie unsere nach Spieltyp sortierten Bildungsleitfäden',
    filterBy: 'Filtern nach:',
    all: 'Alle',
    viewAll: 'Alle ansehen',
    readMore: 'Weiterlesen',
    relatedGuides: 'Ähnliche Anleitungen',
    youMightLike: 'Das könnte Ihnen auch gefallen',
    footerTagline: 'Bildungshandbücher für Online-Casinospiele. Wir erklären, wie Spiele funktionieren - keine Versprechungen, keine Garantien.',
    quickLinks: 'Schnelllinks',
    legal: 'Rechtliches',
    responsibleGambling: 'Verantwortungsvolles Spielen',
    privacyPolicy: 'Datenschutzrichtlinie',
    termsOfService: 'Nutzungsbedingungen',
    eighteenPlus: 'Nur 18+',
    gambleResponsibly: 'Spielen Sie verantwortungsbewusst.',
    notFinancialAdvice: 'Keine Finanz- oder Glücksspielberatung.',
  },
  ru: {
    geoDisclaimer: 'Законы об азартных играх зависят от страны. Эта информация предназначена только для ознакомительных целей.',
    educationalPurpose: 'Это руководство объясняет, как работает игра и где в нее можно играть (в соответствии с местным законодательством).',
    affiliateDisclosure: 'Некоторые ссылки могут быть коммерческими.',
    whereToPlay: 'Где играть',
    gameAvailability: 'Доступность игры',
    availabilityNote: 'Доступность оператора и игр варьируется в зависимости от региона. Проверьте детали перед продолжением.',
    availabilityWarning: 'Предупреждение: доступность варьируется в зависимости от юрисдикции. Всегда проверяйте законность в вашем регионе.',
    featured: 'Рекомендуемые',
    latest: 'Последние',
    browseByCategory: 'Просмотр по категориям',
    exploreGuides: 'Изучите наши обучающие руководства с сортировкой по типам игр',
    filterBy: 'Фильтровать по:',
    all: 'Все',
    viewAll: 'Посмотреть все',
    readMore: 'Читать далее',
    relatedGuides: 'Похожие руководства',
    youMightLike: 'Вам также может понравиться',
    footerTagline: 'Обучающие руководства по играм в онлайн-казино. Мы объясняем, как работают игры - никаких обещаний, никаких гарантий.',
    quickLinks: 'Быстрые ссылки',
    legal: 'Правовая информация',
    responsibleGambling: 'Ответственная игра',
    privacyPolicy: 'Политика конфиденциальности',
    termsOfService: 'Условия использования',
    eighteenPlus: 'Только 18+',
    gambleResponsibly: 'Играйте ответственно.',
    notFinancialAdvice: 'Не является финансовым или игровым советом.',
  },
};

export const CATEGORY_NAMES: Record<string, Record<Locale, string>> = {
  slots: { en: 'Slots', fr: 'Machines a sous', de: 'Spielautomaten', ru: 'Слоты' },
  'crash-games': { en: 'Crash Games', fr: 'Jeux crash', de: 'Crash-Spiele', ru: 'Краш-игры' },
  'live-casino': { en: 'Live Casino', fr: 'Casino live', de: 'Live-Casino', ru: 'Лайв-казино' },
  'table-games': { en: 'Table Games', fr: 'Jeux de table', de: 'Tischspiele', ru: 'Настольные игры' },
  strategy: { en: 'Strategy Guides', fr: 'Guides de strategie', de: 'Strategie-Anleitungen', ru: 'Руководства по стратегиям' },
  reviews: { en: 'Game Reviews', fr: 'Avis sur les jeux', de: 'Spielbewertungen', ru: 'Обзоры игр' },
};

export function getCategoryName(slug: string, locale: Locale): string {
  return CATEGORY_NAMES[slug]?.[locale] || slug;
}
