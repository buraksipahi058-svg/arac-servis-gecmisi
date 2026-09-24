import "server-only";
import { createHash, randomInt } from "node:crypto";

// Karışıklık yaratan karakterler yok: 0/O, 1/I/L. 31 karakter, 8 hane ≈ 39,6 bit.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 8;
const CODE_PATTERN = new RegExp(`^[${ALPHABET}]{${CODE_LENGTH}}$`);

// Kriptografik olarak güvenli, eşit dağılımlı rastgele kod (normalize biçimde: "X7K9P4M2").
export function generateShareCode(): string {
  let code = "";
  for (let index = 0; index < CODE_LENGTH; index++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return code;
}

// Kullanıcı girişi → normalize kod ("x7k9 - p4m2" → "X7K9P4M2"); geçersizse null.
export function normalizeShareCode(input: string): string | null {
  const code = input.toUpperCase().replace(/[\s-]/g, "");
  return CODE_PATTERN.test(code) ? code : null;
}

// "X7K9P4M2" → "X7K9-P4M2"
export function formatShareCode(code: string): string {
  return `${code.slice(0, 4)}-${code.slice(4)}`;
}

// DB'de yalnızca bu hash saklanır.
export function hashShareCode(normalizedCode: string): string {
  return createHash("sha256").update(normalizedCode).digest("hex");
}
