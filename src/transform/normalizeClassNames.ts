import { parseClassString } from "./classTokens";
import { simplifyClassTokens } from "./simplifyClassTokens";
import { serializeClassTokens } from "./serializeClassTokens";

export function normalizeClassNames(input: string): string {
  const classNameRegex = /className\s*=\s*"([\s\S]*?)"/gm;

  let output = input;
  let match: RegExpExecArray | null;

  while ((match = classNameRegex.exec(input)) !== null) {
    const full = match[0];
    const inner = match[1];

    const tokens = parseClassString(inner);
    const simplified = simplifyClassTokens(tokens);
    const cleaned = serializeClassTokens(simplified);

    const replacement = `className="${cleaned}"`;

    if (full === replacement) continue;

    output = output.replace(full, replacement);
  }

  return output;
}
