// Sidebar category names stay fixed; each API game is matched to one of them
// by name/slug keywords. The first matching rule wins, so order matters
// (e.g. "29Card Baccarat" must hit Baccarat before the Teenpatti slug rule).
const CATEGORY_RULES = [
  { name: 'Roulette', test: ({ name }) => /roulette/i.test(name) },
  { name: 'Poker', test: ({ name }) => /poker/i.test(name) },
  { name: 'Baccarat', test: ({ name }) => /baccarat/i.test(name) },
  {
    name: 'Dragon Tiger',
    test: ({ name }) => /dragon\s*tiger|\bd\s*t\s*l\b/i.test(name),
  },
  { name: '32 Cards', test: ({ name }) => /32\s*cards?/i.test(name) },
  { name: 'Andar Bahar', test: ({ name }) => /andar\s*bahar/i.test(name) },
  { name: 'Lucky 7', test: ({ name }) => /lucky\s*7/i.test(name) },
  {
    name: '3 Card Judgement',
    test: ({ name }) => /3\s*cards?\s*judg/i.test(name),
  },
  { name: 'Casino War', test: ({ name }) => /\bwar\b/i.test(name) },
  { name: 'Worli', test: ({ name }) => /worli|matka/i.test(name) },
  { name: 'Lottery', test: ({ name }) => /lotter/i.test(name) },
  { name: 'Bollywood', test: ({ name }) => /bollywood/i.test(name) },
  { name: 'Race', test: ({ name }) => /\brace/i.test(name) },
  {
    name: 'Sports',
    test: ({ name }) => /cricket|super\s*over|\bgoal\b|ball by ball/i.test(name),
  },
  {
    name: 'Teenpatti',
    test: ({ name, slug }) =>
      /teen\s*patti/i.test(name) || /^(teen|patti|poison|joker)/i.test(slug),
  },
  { name: 'Queen', test: ({ name }) => /queen/i.test(name) },
];

export const getCasinoCategory = (game) => {
  const rule = CATEGORY_RULES.find((r) => r.test(game));
  return rule ? rule.name : 'Others';
};

// Only these games have a playable table page; others are shown but not clickable
export const PLAYABLE_SLUGS = new Set([
  'teen62',
  'poison',
  'teenmuf',
  'poison20',
  'joker120',
  'joker20',
  'joker1',
  'teen20c',
  'teen41',
  'teen42',
  'teen33',
  'teen32',
  'teen',
  'teen20',
  'teen9',
  'teen8',
]);

// Normalises the API list ({ eventName, name, image }) into display objects
export const mapCasinoGames = (data) =>
  (data || [])
    .filter((game) => game?.eventName && game?.name)
    .map((game) => {
      const base = { slug: game.eventName, name: game.name, image: game.image };
      return { ...base, category: getCasinoCategory(base) };
    });
