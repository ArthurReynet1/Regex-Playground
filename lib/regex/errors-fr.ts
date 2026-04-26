const errorMap: Record<string, string> = {
  "Invalid regular expression": "Expression régulière invalide",
  "Unterminated group": "Groupe non fermé (parenthèse manquante)",
  "Unmatched ')'": "Parenthèse fermante sans ouvrante",
  "Lone quantifier brackets": "Accolade de quantifieur isolée",
  "Nothing to repeat": "Rien à répéter — quantifieur sans cible",
  "Out of order in character class": "Plage de caractères inversée (ex: [z-a])",
  "Invalid character class": "Classe de caractères invalide",
  "Unterminated character class":
    "Classe de caractères non fermée (crochet manquant)",
  "Invalid escape": "Échappement invalide",
  "Invalid Unicode escape": "Échappement Unicode invalide",
  "Invalid named capture": "Groupe nommé invalide",
  "Duplicate capture group name": "Nom de groupe en doublon",
  "Invalid group": "Groupe invalide",
  "Invalid quantifier": "Quantifieur invalide",
  "Invalid named reference": "Référence nommée invalide",
  "Invalid backreference": "Backreference invalide",
  "Quantifier brackets": "Accolades de quantifieur invalides",
  "Invalid unicode property": "Propriété Unicode invalide",
  "Invalid range": "Plage de caractères invalide",
  "Invalid flags": "Drapeaux (flags) invalides",
};

export const translateError = (message: string): string | undefined => {
  for (const [en, fr] of Object.entries(errorMap)) {
    if (message.startsWith(en)) return fr;
  }
  return undefined;
};
