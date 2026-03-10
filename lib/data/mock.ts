export interface Recipe {
  id: string;
  name: string;
  description: string;
  tags: string[];
  servings: number;
  timeMinutes: number;
  rating: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
}

export const RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Pasta al Pomodoro',
    description:
      'Un classico intramontabile, veloce e saporito. Perfetto per una cena in fretta senza rinunciare al gusto.',
    tags: ['veloce', 'vegetariano'],
    servings: 4,
    timeMinutes: 20,
    rating: 5,
    ingredients: [
      { name: 'Rigatoni', amount: '400g' },
      { name: 'Passata di pomodoro', amount: '400ml' },
      { name: 'Aglio', amount: '2 spicchi' },
      { name: "Olio d'oliva", amount: '3 cucchiai' },
      { name: 'Basilico fresco', amount: 'q.b.' },
      { name: 'Parmigiano', amount: '60g' },
      { name: 'Sale e pepe', amount: 'q.b.' },
    ],
    steps: [
      "Porta a ebollizione una pentola d'acqua salata.",
      "Scalda l'olio e soffriggi l'aglio schiacciato per 1 minuto.",
      'Aggiungi la passata, sala e cuoci 10 minuti a fuoco basso.',
      'Cuoci la pasta al dente, scola conservando un po\u2019 d\u2019acqua di cottura.',
      "Mescola la pasta nella salsa, aggiusta con l'acqua di cottura.",
      'Servi con parmigiano e basilico fresco.',
    ],
  },
  {
    id: '2',
    name: 'Risotto ai Funghi',
    description:
      "Cremoso e profumato, perfetto per le serate d'autunno. Il segreto \u00e8 la mantecatura finale.",
    tags: ['vegetariano', 'comfort'],
    servings: 4,
    timeMinutes: 35,
    rating: 4,
    ingredients: [
      { name: 'Riso Arborio', amount: '320g' },
      { name: 'Funghi misti', amount: '300g' },
      { name: 'Brodo vegetale caldo', amount: '1L' },
      { name: 'Cipolla', amount: '1' },
      { name: 'Vino bianco secco', amount: '100ml' },
      { name: 'Burro', amount: '50g' },
      { name: 'Parmigiano grattugiato', amount: '80g' },
      { name: "Olio d'oliva", amount: '2 cucchiai' },
    ],
    steps: [
      'Soffriggi la cipolla tritata con olio e met\u00e0 burro per 3 minuti.',
      'Aggiungi i funghi tagliati, cuoci 5 min fino a evaporazione.',
      'Tosta il riso a fuoco vivo 2 minuti, sfuma con il vino.',
      'Aggiungi brodo caldo un mestolo alla volta mescolando, per 18 minuti.',
      'A fuoco spento manteca con burro rimasto e parmigiano.',
      'Copri e lascia riposare 2 minuti. Servi subito.',
    ],
  },
  {
    id: '3',
    name: 'Pollo al Limone',
    description:
      'Leggero e profumato, ottimo con verdure al vapore. Un piatto di sicuro successo.',
    tags: ['proteico', 'leggero'],
    servings: 4,
    timeMinutes: 30,
    rating: 4,
    ingredients: [
      { name: 'Petti di pollo', amount: '800g' },
      { name: 'Limoni', amount: '2' },
      { name: 'Aglio', amount: '2 spicchi' },
      { name: 'Rosmarino fresco', amount: '2 rametti' },
      { name: "Olio d'oliva", amount: '3 cucchiai' },
      { name: 'Sale e pepe', amount: 'q.b.' },
    ],
    steps: [
      'Batti leggermente i petti per uniformare lo spessore.',
      'Marina in succo di limone, aglio, rosmarino, olio, sale e pepe per 15 min.',
      'Cuoci in padella antiaderente a fuoco medio-alto, 4-5 min per lato.',
      "Aggiungi scorza di limone e un goccio d'acqua, copri e termina la cottura.",
      'Servi con spicchi di limone e verdure al vapore.',
    ],
  },
  {
    id: '4',
    name: 'Insalata Greca',
    description:
      'Fresca e colorata con feta, olive e pomodori. Il piatto perfetto per le giornate calde.',
    tags: ['veloce', 'vegetariano', 'leggero'],
    servings: 2,
    timeMinutes: 10,
    rating: 5,
    ingredients: [
      { name: 'Pomodori', amount: '3 grandi' },
      { name: 'Cetriolo', amount: '1' },
      { name: 'Feta', amount: '200g' },
      { name: 'Olive nere Kalamata', amount: '80g' },
      { name: 'Cipolla rossa', amount: '\u00bd' },
      { name: 'Peperone rosso', amount: '1' },
      { name: 'Origano secco', amount: '1 cucchiaino' },
      { name: "Olio d'oliva", amount: '3 cucchiai' },
    ],
    steps: [
      'Taglia pomodori a spicchi, cetriolo a rondelle, cipolla ad anelli, peperone a listarelle.',
      'Disponi in una ciotola capiente.',
      'Aggiungi olive e il blocco di feta intero sopra.',
      'Condisci con olio, origano e sale.',
      'Servi subito o lascia riposare 10 minuti.',
    ],
  },
  {
    id: '5',
    name: 'Salmone al Forno',
    description:
      'Ricco di omega-3, con erbe aromatiche e limone. Sano, gustoso e facile da preparare.',
    tags: ['proteico', 'leggero'],
    servings: 4,
    timeMinutes: 25,
    rating: 4,
    ingredients: [
      { name: 'Filetti di salmone', amount: '600g (4 pz)' },
      { name: 'Limone', amount: '1' },
      { name: 'Prezzemolo e aneto', amount: 'q.b.' },
      { name: 'Aglio', amount: '1 spicchio' },
      { name: "Olio d'oliva", amount: '2 cucchiai' },
      { name: 'Sale e pepe', amount: 'q.b.' },
    ],
    steps: [
      'Preriscalda il forno a 200\u00b0C. Rivesti una teglia con carta da forno.',
      'Mescola olio, aglio tritato, scorza di limone, sale e pepe.',
      'Disponi i filetti in teglia e condisci con il mix.',
      'Cuoci 12-15 minuti fino a che il salmone sia opaco al centro.',
      'Servi con spicchi di limone e verdure grigliate.',
    ],
  },
  {
    id: '6',
    name: 'Pizza Margherita',
    description:
      'La pizza classica con mozzarella fresca e basilico. Fatta in casa non ha rivali.',
    tags: ['vegetariano', 'comfort'],
    servings: 4,
    timeMinutes: 60,
    rating: 5,
    ingredients: [
      { name: 'Farina 00', amount: '500g' },
      { name: 'Lievito di birra secco', amount: '7g' },
      { name: 'Acqua tiepida', amount: '300ml' },
      { name: 'Sale', amount: '10g' },
      { name: "Olio d'oliva", amount: '2 cucchiai' },
      { name: 'Passata di pomodoro', amount: '300ml' },
      { name: 'Mozzarella fior di latte', amount: '250g' },
      { name: 'Basilico fresco', amount: 'q.b.' },
    ],
    steps: [
      "Sciogli il lievito in acqua tiepida. Impasta con farina, sale e olio per 10 minuti.",
      'Lascia lievitare coperto 1 ora a temperatura ambiente.',
      'Preriscalda il forno al massimo (250\u00b0C) con teglia dentro.',
      "Stendi l'impasto, condisci con la passata, inforna 5 min.",
      'Aggiungi la mozzarella strappata e cuoci altri 5-7 minuti.',
      "Sforna, aggiungi basilico e un filo d'olio crudo.",
    ],
  },
  {
    id: '7',
    name: 'Zuppa di Legumi',
    description:
      'Nutriente e calda, con ceci, lenticchie e rosmarino. Il conforto in una ciotola.',
    tags: ['vegano', 'comfort'],
    servings: 4,
    timeMinutes: 45,
    rating: 3,
    ingredients: [
      { name: 'Ceci cotti', amount: '400g' },
      { name: 'Lenticchie', amount: '200g' },
      { name: 'Carote', amount: '2' },
      { name: 'Sedano', amount: '2 coste' },
      { name: 'Cipolla', amount: '1' },
      { name: 'Pomodori pelati', amount: '400g' },
      { name: 'Brodo vegetale', amount: '1.5L' },
      { name: 'Rosmarino', amount: '1 rametto' },
      { name: "Olio d'oliva", amount: '3 cucchiai' },
    ],
    steps: [
      'Soffriggi cipolla, carote e sedano tritati in olio per 5 minuti.',
      'Aggiungi pomodori schiacciati, cuoci altri 3 minuti.',
      'Unisci lenticchie, ceci e brodo. Porta a ebollizione.',
      'Abbassa il fuoco, aggiungi rosmarino, cuoci 30 minuti.',
      "Regola di sale. Servi con filo d'olio crudo e pane.",
    ],
  },
];

// ── Planner ──────────────────────────────────────────────────────────────────

export interface CourseSlot {
  recipeId: string;
  recipeName: string;
}

export interface MealPlan {
  primo: CourseSlot | null;
  secondo: CourseSlot | null;
}

export interface DayPlan {
  pranzo: MealPlan;
  cena: MealPlan;
}

const empty = (): MealPlan => ({ primo: null, secondo: null });
const single = (id: string, name: string): MealPlan => ({ primo: { recipeId: id, recipeName: name }, secondo: null });
const double = (id1: string, n1: string, id2: string, n2: string): MealPlan => ({
  primo: { recipeId: id1, recipeName: n1 },
  secondo: { recipeId: id2, recipeName: n2 },
});

export const CURRENT_WEEK_PLAN: DayPlan[] = [
  {
    pranzo: double('1', 'Pasta al Pomodoro', '4', 'Insalata Greca'),
    cena: single('3', 'Pollo al Limone'),
  },
  {
    pranzo: single('4', 'Insalata Greca'),
    cena: double('2', 'Risotto ai Funghi', '5', 'Salmone al Forno'),
  },
  { pranzo: empty(), cena: single('5', 'Salmone al Forno') },
  { pranzo: single('6', 'Pizza Margherita'), cena: empty() },
  { pranzo: empty(), cena: empty() },
  {
    pranzo: single('2', 'Risotto ai Funghi'),
    cena: single('3', 'Pollo al Limone'),
  },
  { pranzo: empty(), cena: single('6', 'Pizza Margherita') },
];

// ── Shopping ─────────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: string;
}

export const SHOPPING_ITEMS: ShoppingItem[] = [
  { id: 's1', name: 'Pomodori', quantity: '800g', category: 'Frutta e Verdura' },
  { id: 's2', name: 'Funghi misti', quantity: '300g', category: 'Frutta e Verdura' },
  { id: 's3', name: 'Limoni', quantity: '3', category: 'Frutta e Verdura' },
  { id: 's4', name: 'Insalata mista', quantity: '1 busta', category: 'Frutta e Verdura' },
  { id: 's5', name: 'Cetriolo', quantity: '1', category: 'Frutta e Verdura' },
  { id: 's6', name: 'Peperone rosso', quantity: '2', category: 'Frutta e Verdura' },
  { id: 's7', name: 'Cipolla rossa', quantity: '1', category: 'Frutta e Verdura' },
  { id: 's8', name: 'Petto di pollo', quantity: '800g', category: 'Carne e Pesce' },
  { id: 's9', name: 'Salmone (filetti)', quantity: '600g', category: 'Carne e Pesce' },
  { id: 's10', name: 'Parmigiano', quantity: '200g', category: 'Latticini e Uova' },
  { id: 's11', name: 'Mozzarella fior di latte', quantity: '2 pz', category: 'Latticini e Uova' },
  { id: 's12', name: 'Feta', quantity: '200g', category: 'Latticini e Uova' },
  { id: 's13', name: 'Burro', quantity: '100g', category: 'Latticini e Uova' },
  { id: 's14', name: 'Rigatoni', quantity: '500g', category: 'Pasta e Cereali' },
  { id: 's15', name: 'Riso Arborio', quantity: '400g', category: 'Pasta e Cereali' },
  { id: 's16', name: 'Farina 00', quantity: '500g', category: 'Pasta e Cereali' },
  { id: 's17', name: 'Passata di pomodoro', quantity: '700ml', category: 'Dispensa' },
  { id: 's18', name: 'Olive nere Kalamata', quantity: '150g', category: 'Dispensa' },
  { id: 's19', name: 'Brodo vegetale', quantity: '1L', category: 'Dispensa' },
  { id: 's20', name: 'Vino bianco secco', quantity: '1 bicchiere', category: 'Dispensa' },
];

export const SHOPPING_CATEGORIES = [
  'Frutta e Verdura',
  'Carne e Pesce',
  'Latticini e Uova',
  'Pasta e Cereali',
  'Dispensa',
];

// ── Pantry ────────────────────────────────────────────────────────────────────

export interface PantryItem {
  id: string;
  name: string;
  category: string;
  hasIt: boolean;
}

export const PANTRY_ITEMS: PantryItem[] = [
  { id: 'p1', name: "Olio d'oliva", category: 'Condimenti', hasIt: true },
  { id: 'p2', name: 'Sale', category: 'Condimenti', hasIt: true },
  { id: 'p3', name: 'Pepe nero', category: 'Condimenti', hasIt: true },
  { id: 'p4', name: 'Aceto balsamico', category: 'Condimenti', hasIt: false },
  { id: 'p5', name: 'Salsa di soia', category: 'Condimenti', hasIt: false },
  { id: 'p6', name: 'Pasta', category: 'Cereali e Legumi', hasIt: true },
  { id: 'p7', name: 'Riso', category: 'Cereali e Legumi', hasIt: false },
  { id: 'p8', name: 'Farina 00', category: 'Cereali e Legumi', hasIt: true },
  { id: 'p9', name: 'Ceci (in scatola)', category: 'Cereali e Legumi', hasIt: true },
  { id: 'p10', name: 'Lenticchie', category: 'Cereali e Legumi', hasIt: false },
  { id: 'p11', name: 'Parmigiano', category: 'Latticini', hasIt: false },
  { id: 'p12', name: 'Uova', category: 'Latticini', hasIt: true },
  { id: 'p13', name: 'Burro', category: 'Latticini', hasIt: true },
  { id: 'p14', name: 'Latte', category: 'Latticini', hasIt: false },
  { id: 'p15', name: 'Pomodori pelati', category: 'Conserve', hasIt: true },
  { id: 'p16', name: 'Tonno in scatola', category: 'Conserve', hasIt: true },
  { id: 'p17', name: 'Olive', category: 'Conserve', hasIt: false },
  { id: 'p18', name: 'Aglio', category: 'Verdure', hasIt: true },
  { id: 'p19', name: 'Cipolla', category: 'Verdure', hasIt: true },
  { id: 'p20', name: 'Patate', category: 'Verdure', hasIt: false },
];

export const PANTRY_CATEGORIES = ['Condimenti', 'Cereali e Legumi', 'Latticini', 'Conserve', 'Verdure'];
