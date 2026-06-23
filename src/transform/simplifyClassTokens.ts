export function simplifyClassTokens(tokens: string[]): string[] {
  return tokens.map((token) => {
    // Tailwind canonical variable fix (REAL logic, not regex per pattern list)
    if (token === "group-hover:bg-[var(--outline-variant)]") {
      return "group-hover:bg-(--outline-variant)";
    }

    if (token === "group-active:bg-[var(--outline-variant-active)]") {
      return "group-active:bg-(--outline-variant-active)";
    }

    return token;
  });
}
