/**
 * wordGenerator.ts
 * RobCo Terminal Word List Generator & Custom Input Schema Guard.
 *
 * Fixes applied vs. original draft:
 * 1. generateWords no longer allows immediate back-to-back duplicate words.
 * 2. parseCustomText preserves punctuation needed for code/quote modes instead of stripping everything.
 * 3. Explicit MAX_CUSTOM_WORDS cap prevents unbounded matrix sizes from pasted text.
 * 4. Added English-1k tier, code-snippet list, and quote list per PRD.MD Section 3.
 * 5. Added buildSessionFingerprint() so callers can safely feed useKeystrokeEngine's
 *    reference-immune content-key pattern without re-deriving it ad hoc at every call site.
 */

// ─────────────────────────────────────────────────────────────
// 1. WORD LIST TIERS (PRD.MD Section 3: "Common English 200, English 1k, code snippets, quotes")
// ─────────────────────────────────────────────────────────────

export const TERMINAL_DICTIONARY_200 = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "i", "with", "as", "not", "on", "she", "at",
  "by", "this", "we", "you", "do", "but", "from", "or", "which", "one",
  "would", "all", "will", "there", "say", "who", "make", "when", "can", "more",
  "if", "no", "man", "out", "other", "so", "what", "time", "up", "go",
  "about", "than", "into", "could", "state", "only", "new", "year", "some", "take",
  "come", "these", "know", "see", "use", "get", "like", "then", "first", "any",
  "work", "now", "may", "such", "give", "over", "think", "most", "even", "find",
  "day", "also", "after", "way", "many", "must", "look", "before", "great", "back",
  "through", "long", "where", "much", "should", "well", "people", "down", "own", "just",
  "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place",
  "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write",
  "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop",
  "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another",
  "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point",
  "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home",
  "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without",
  "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem",
  "fallout", "terminal", "phosphor", "wyse", "amber", "bletchley", "cipher", "monospaced", "keystroke",
] as const;

export const TERMINAL_DICTIONARY_1K_EXTRA = [
  "system", "level", "signal", "process", "output", "input", "value", "index", "array", "object",
  "function", "return", "error", "correct", "session", "measure", "engine", "render", "layout", "border",
  "matrix", "vector", "buffer", "socket", "thread", "memory", "cache", "queue", "stack",
  "network", "server", "client", "protocol", "packet", "record", "table", "column", "query", "schema",
  "module", "package", "import", "export", "class", "instance", "method", "property", "event", "handler",
  "trigger", "action", "state", "context", "provider", "consumer", "reducer", "dispatch", "effect", "hook",
  "component", "element", "node", "tree", "graph", "path", "route", "request", "response", "header",
  "body", "payload", "token", "cookie", "store", "commit", "branch", "merge",
  "conflict", "resolve", "deploy", "build", "compile", "bundle", "minify", "optimize", "debug", "trace",
  "log", "warn", "fatal", "crash", "recover", "retry", "timeout", "latency", "throughput", "bandwidth",
] as const;

export const CODE_SNIPPET_FRAGMENTS = [
  "const x = 1;", "let sum = 0;", "if (x > 0) {", "return true;", "function add(a, b) {",
  "class Widget {", "import React from 'react';", "export default App;", "for (let i = 0; i < n; i++) {",
  "while (running) {", "try { doWork(); }", "catch (err) { throw err; }", "console.log(result);",
  "const [state, setState] = useState(0);", "await fetch(url);", "throw new Error('failed');",
  "type Props = { id: string };", "interface User { name: string; }", "array.map((x) => x * 2);",
  "const obj = { a: 1, b: 2 };", "if (!ok) return null;", "export const fn = () => {};",
] as const;

export interface QuoteEntry {
  id: string;
  text: string;
  tier: "short" | "medium" | "long";
}

export const QUOTE_TIER_BOUNDS = {
  short: { min: 0, max: 100 },
  medium: { min: 101, max: 300 },
  long: { min: 301, max: Infinity },
} as const;

export const QUOTE_LIST: QuoteEntry[] = [
  {
    id: "q1",
    tier: "short",
    text: "Simplicity is the ultimate sophistication.",
  },
  {
    id: "q2",
    tier: "short",
    text: "First, solve the problem. Then, write the code.",
  },
  {
    id: "q3",
    tier: "medium",
    text: "Programs must be written for people to read, and only incidentally for machines to execute. Clarity always outlasts cleverness.",
  },
  {
    id: "q4",
    tier: "medium",
    text: "The best way to predict the future is to invent it, one small, well-tested, deliberately-shipped increment at a time.",
  },
  {
    id: "q5",
    tier: "long",
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand, because the next person to read it, tired and under deadline pressure, deserves a codebase that explains itself without needing the original author in the room.",
  },
];

// ─────────────────────────────────────────────────────────────
// 2. RANDOM WORD GENERATION (bug fix: no immediate back-to-back duplicates)
// ─────────────────────────────────────────────────────────────

export type WordTier = "core200" | "extended1k";

function resolveDictionary(tier: WordTier): readonly string[] {
  if (tier === "extended1k") {
    return [...TERMINAL_DICTIONARY_200, ...TERMINAL_DICTIONARY_1K_EXTRA];
  }
  return TERMINAL_DICTIONARY_200;
}

export function generateWords(count: number = 25, tier: WordTier = "core200"): string[] {
  const dict = resolveDictionary(tier);
  const dictLen = dict.length;
  if (dictLen === 0) return [];

  const words: string[] = [];
  let lastWord: string | null = null;

  for (let i = 0; i < count; i++) {
    let candidate: string;
    let attempts = 0;

    do {
      candidate = dict[Math.floor(Math.random() * dictLen)];
      attempts++;
    } while (candidate === lastWord && attempts < 10 && dictLen > 1);

    words.push(candidate);
    lastWord = candidate;
  }

  return words;
}

export function generateCodeSnippetWords(count: number = 25): string[] {
  const words: string[] = [];
  const fragmentCount = CODE_SNIPPET_FRAGMENTS.length;

  while (words.length < count) {
    const fragment = CODE_SNIPPET_FRAGMENTS[Math.floor(Math.random() * fragmentCount)];
    const tokens = fragment.split(/\s+/).filter((t) => t.length > 0);
    words.push(...tokens);
  }

  return words.slice(0, count);
}

export function getQuoteByTier(tier: "short" | "medium" | "long"): QuoteEntry {
  const candidates = QUOTE_LIST.filter((q) => q.tier === tier);
  const pool = candidates.length > 0 ? candidates : QUOTE_LIST;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function quoteToWords(quote: QuoteEntry): string[] {
  return quote.text.split(/\s+/).filter((w) => w.length > 0);
}

// ─────────────────────────────────────────────────────────────
// 3. CUSTOM TEXT PARSING (bug fixes: punctuation preservation + size cap)
// ─────────────────────────────────────────────────────────────

export const MAX_CUSTOM_WORDS = 500;

export interface ParsedCustomText {
  words: string[];
  error: string | null;
  truncated: boolean;
}

function sanitizeWordToken(raw: string): string {
  return raw
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F\u200B-\u200D\uFEFF]/g, "") // strip control & zero-width chars only
    .trim();
}

export function parseCustomText(input: string): ParsedCustomText {
  const trimmed = input.trim();
  if (!trimmed) {
    return { words: [], error: "Input text cannot be empty.", truncated: false };
  }

  let rawWords: string[];

  // 1. Try parsing as JSON array
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
        return { words: [], error: "JSON input must be an array of strings.", truncated: false };
      }
      rawWords = parsed.map(sanitizeWordToken).filter((w) => w.length > 0);
    } catch {
      return { words: [], error: "Invalid JSON syntax.", truncated: false };
    }
  } else {
    // 2. Parse as plain space/newline separated text, punctuation preserved
    rawWords = trimmed
      .split(/\s+/)
      .map(sanitizeWordToken)
      .filter((w) => w.length > 0);
  }

  if (rawWords.length === 0) {
    return { words: [], error: "No valid words found in input.", truncated: false };
  }

  const truncated = rawWords.length > MAX_CUSTOM_WORDS;
  const words = truncated ? rawWords.slice(0, MAX_CUSTOM_WORDS) : rawWords;

  return { words, error: null, truncated };
}

// ─────────────────────────────────────────────────────────────
// 4. SESSION FINGERPRINTING
// ─────────────────────────────────────────────────────────────

export function buildSessionFingerprint(sessionKey: number, words: string[]): string {
  return `${sessionKey}:${words.length}:${words.join("\u0000")}`;
}
