const classCanonicalMap: Record<string, string> = {
  "group-hover:bg-[var(--outline-variant)]":
    "group-hover:bg-(--outline-variant)",

  "group-active:bg-[var(--outline-variant-active)]":
    "group-active:bg-(--outline-variant-active)",
};

export function fixTailwindWarnings(input: string): string {
  const classNameRegex = /className\s*=\s*"([\s\S]*?)"/gm;

  let output = input;
  let match: RegExpExecArray | null;

  while ((match = classNameRegex.exec(input)) !== null) {
    const full = match[0];
    const inner = match[1];

    const tokens = inner.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);

    const transformed = tokens.map((t) => classCanonicalMap[t] ?? t);

    const cleaned = transformed.join(" ");

    const replacement = `className="${cleaned}"`;

    if (full === replacement) continue;

    output = output.replace(full, replacement);
  }

  return output;
}

// const tailwindFixes: Array<[RegExp, string]> = [
//   [
//     /group-hover:bg-\[var\(--outline-variant\)\]/g,
//     "group-hover:bg-(--outline-variant)",
//   ],
//   [
//     /group-active:bg-\[var\(--outline-variant-active\)\]/g,
//     "group-active:bg-(--outline-variant-active)",
//   ],
// ];

// export function fixTailwindWarnings(input: string): string {
//   let output = input;

//   for (const [pattern, replacement] of tailwindFixes) {
//     output = output.replace(pattern, replacement);
//   }

//   return output;
// }
