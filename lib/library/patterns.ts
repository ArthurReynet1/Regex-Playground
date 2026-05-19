export type LibraryCategory =
  | "Identifiants"
  | "France"
  | "Web"
  | "Formats"
  | "Logs & data";

export type LibraryPattern = {
  id: string;
  name: string;
  category: LibraryCategory;
  source: string;
  flags: string;
  description: string;
  testText: string;
};

export const LIBRARY_PATTERNS: LibraryPattern[] = [
  // ─────────────── Identifiants ───────────────
  {
    id: "uuid-v4",
    name: "UUID v4",
    category: "Identifiants",
    source:
      "^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$",
    flags: "gim",
    description:
      "Identifiant unique universel version 4 (8-4-4-4-12). Flag m pour matcher ligne par ligne.",
    testText:
      "550e8400-e29b-41d4-a716-446655440000\nF47AC10B-58CC-4372-A567-0E02B2C3D479\n550e8400-e29b-31d4-a716-446655440000",
  },
  {
    id: "siret",
    name: "SIRET",
    category: "Identifiants",
    source: "^\\d{14}$",
    flags: "gm",
    description:
      "Numéro SIRET — 14 chiffres (validation Luhn à faire côté serveur).",
    testText: "73282932000074\n12345678901234\n123",
  },
  {
    id: "hex-color",
    name: "Couleur hexadécimale",
    category: "Identifiants",
    source: "^#(?:[0-9a-fA-F]{3}){1,2}$",
    flags: "gm",
    description: "Couleur HTML/CSS — #abc ou #aabbcc.",
    testText: "#fff\n#FF0000\n#abcdef\n#xyz\n#1234",
  },

  // ─────────────── France ───────────────
  {
    id: "email",
    name: "Email",
    category: "France",
    source: "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
    flags: "gm",
    description:
      "Adresse email simplifiée (pas RFC 5322 complet — suffit pour la validation front).",
    testText:
      "arthur.reynet@gmail.com\ncontact+test@example.fr\nbad@email\n@nope.com",
  },
  {
    id: "phone-fr",
    name: "Téléphone FR",
    category: "France",
    source:
      "^(?:(?:\\+|00)33|0)\\s?[1-9](?:[\\s.-]?\\d{2}){4}$",
    flags: "gm",
    description:
      "Numéro de téléphone français — fixe ou mobile, formats +33 / 0033 / 0X.",
    testText:
      "+33 6 12 34 56 78\n0612345678\n06.12.34.56.78\n0033 1 23 45 67 89\n+44 7700 900900",
  },
  {
    id: "postal-code-fr",
    name: "Code postal FR",
    category: "France",
    source: "^(?:0[1-9]|[1-8]\\d|9[0-8])\\d{3}$",
    flags: "gm",
    description:
      "Code postal français — 5 chiffres, exclut 00xxx et 99xxx (non attribués).",
    testText: "75001\n13008\n98700\n00100\n99999\n7500",
  },

  // ─────────────── Web ───────────────
  {
    id: "url-http",
    name: "URL HTTP(S)",
    category: "Web",
    source:
      "^https?:\\/\\/(?:[\\w-]+\\.)+[a-z]{2,}(?:\\/[^\\s]*)?$",
    flags: "gim",
    description: "URL avec protocole HTTP ou HTTPS.",
    testText:
      "https://example.com\nhttp://sub.domain.co.uk/path?q=1\nftp://nope.com\nnot-a-url",
  },
  {
    id: "ipv4",
    name: "Adresse IPv4",
    category: "Web",
    source:
      "^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d{1,2})$",
    flags: "gm",
    description:
      "Adresse IPv4 — quatre octets 0-255 séparés par des points.",
    testText: "192.168.1.1\n8.8.8.8\n255.255.255.255\n256.0.0.1\n10.0.0",
  },

  // ─────────────── Formats ───────────────
  {
    id: "iso-date",
    name: "Date ISO 8601",
    category: "Formats",
    source: "^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$",
    flags: "gm",
    description: "Date au format YYYY-MM-DD (sans validation de jour/mois).",
    testText: "2026-05-19\n2024-02-29\n2024-13-01\n2024-02-32",
  },
  {
    id: "time-24h",
    name: "Heure HH:MM:SS",
    category: "Formats",
    source: "^(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d$",
    flags: "gm",
    description: "Heure en format 24h avec secondes.",
    testText: "00:00:00\n23:59:59\n12:34:56\n24:00:00\n12:60:00",
  },

  // ─────────────── Logs & data ───────────────
  {
    id: "iso-timestamp",
    name: "Timestamp ISO 8601",
    category: "Logs & data",
    source:
      "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:?\\d{2})$",
    flags: "gm",
    description: "Timestamp complet avec date+heure+offset (logs serveur).",
    testText:
      "2026-05-19T14:32:01Z\n2026-05-19T14:32:01.123Z\n2026-05-19T14:32:01+02:00\n2026-05-19 14:32:01",
  },
  {
    id: "http-status",
    name: "Status HTTP",
    category: "Logs & data",
    source: "\\b[1-5]\\d{2}\\b",
    flags: "g",
    description: "Code de statut HTTP (100-599) dans un log.",
    testText:
      "GET /api 200 OK 1.2ms\nGET /missing 404 Not Found\nPOST /create 500 Internal Server Error\nPort 8080\n42 lines",
  },
];
