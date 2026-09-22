/**
 * Team codes: six characters, read out loud across a lab or typed off a
 * screenshot at 1am, so the alphabet leaves out everything that can be misread
 * as something else — no 0 or O, no 1, I or L.
 *
 * 31 characters to the power of 6 is 887 million codes: far more than there
 * will ever be teams, so a code can't be guessed by counting.
 */
/** also what a code scrambles through before it settles, on the team page */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const ALPHABET = CODE_ALPHABET;
export const CODE_LENGTH = 6;
const VALID = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);

/** A fresh random code. Works the same in the browser and on the server. */
export function newCode(): string {
  // rejection sampling, so every character is equally likely: 248 is the
  // largest multiple of 31 that fits in a byte
  const out: string[] = [];
  while (out.length < CODE_LENGTH) {
    for (const byte of crypto.getRandomValues(new Uint8Array(12))) {
      if (byte < 248 && out.length < CODE_LENGTH) out.push(ALPHABET[byte % ALPHABET.length]);
    }
  }
  return out.join("");
}

/** What someone typed, as a code: case, spaces and the dash don't matter. */
export function cleanCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** A code from an address, tidied the same way, however it was typed into the bar. */
export function codeFromPath(raw: string): string {
  let s = raw;
  try {
    s = decodeURIComponent(raw);
  } catch {
    /* a stray % — read it as it came */
  }
  return cleanCode(s);
}

export function isCode(code: string): boolean {
  return VALID.test(code);
}

/** K7X2QM → K7X-2QM, which is how it's printed everywhere a person reads it. */
export function showCode(code: string): string {
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/** The page a teammate lands on from the link or the QR. */
export function joinPath(code: string): string {
  return `/register/join/${code}`;
}

export function teamPath(code: string): string {
  return `/register/team/${code}`;
}
