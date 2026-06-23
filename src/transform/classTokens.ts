export function parseClassString(input: string): string[] {
  return input.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
}
