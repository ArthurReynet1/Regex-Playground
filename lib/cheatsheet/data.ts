export type CheatSheetEntry = {
  syntax: string;
  description: string;
};

export type CheatSheetSection = {
  title: string;
  entries: CheatSheetEntry[];
};

export const REGEX_SECTIONS: CheatSheetSection[] = [
  {
    title: "Caractères et classes",
    entries: [
      { syntax: ".", description: "Tout caractère (sauf saut de ligne)" },
      { syntax: "\\d / \\D", description: "Chiffre / pas un chiffre" },
      { syntax: "\\w / \\W", description: "Caractère de mot / hors mot" },
      { syntax: "\\s / \\S", description: "Espace blanc / pas un espace" },
      { syntax: "[abc]", description: "Un des caractères listés" },
      { syntax: "[^abc]", description: "Tout sauf les caractères listés" },
      { syntax: "[a-z]", description: "Plage de caractères" },
      { syntax: "\\p{Letter}", description: "Propriété Unicode (flag u/v)" },
    ],
  },
  {
    title: "Ancres",
    entries: [
      { syntax: "^", description: "Début de chaîne (ou de ligne avec m)" },
      { syntax: "$", description: "Fin de chaîne (ou de ligne avec m)" },
      { syntax: "\\b", description: "Limite de mot" },
      { syntax: "\\B", description: "Pas de limite de mot" },
    ],
  },
  {
    title: "Quantifieurs",
    entries: [
      { syntax: "*", description: "0 ou plus" },
      { syntax: "+", description: "1 ou plus" },
      { syntax: "?", description: "0 ou 1 (optionnel)" },
      { syntax: "{n}", description: "Exactement n" },
      { syntax: "{n,}", description: "Au moins n" },
      { syntax: "{n,m}", description: "Entre n et m" },
      { syntax: "*? +? ??", description: "Versions lazy" },
    ],
  },
  {
    title: "Groupes & alternance",
    entries: [
      { syntax: "(...)", description: "Groupe capturant" },
      { syntax: "(?:...)", description: "Groupe non capturant" },
      { syntax: "(?<name>...)", description: "Groupe nommé" },
      { syntax: "a|b", description: "a ou b (alternance)" },
      { syntax: "\\1", description: "Backreference au groupe #1" },
      { syntax: "\\k<name>", description: "Backreference nommée" },
    ],
  },
  {
    title: "Lookarounds",
    entries: [
      { syntax: "(?=...)", description: "Lookahead positif" },
      { syntax: "(?!...)", description: "Lookahead négatif" },
      { syntax: "(?<=...)", description: "Lookbehind positif" },
      { syntax: "(?<!...)", description: "Lookbehind négatif" },
    ],
  },
];

export type ShortcutEntry = {
  combo: string;
  description: string;
};

export const SHORTCUTS: ShortcutEntry[] = [
  { combo: "⌘K / Ctrl+K", description: "Ouvrir la bibliothèque" },
  { combo: "⌘S / Ctrl+S", description: "Copier l'URL de partage" },
  { combo: "⌘↵ / Ctrl+Enter", description: "Copier le snippet d'export" },
  { combo: "?", description: "Ouvrir cette cheatsheet" },
  { combo: "Esc", description: "Fermer le dialog actif" },
];
