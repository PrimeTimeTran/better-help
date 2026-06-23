type LineInfo = {
  code: string;
  comment: string | null;
};

function parseLine(line: string): LineInfo {
  const idx = line.indexOf("//");

  // no comment at all
  if (idx === -1) {
    return { code: line, comment: null };
  }

  const before = line.slice(0, idx);

  // 🚨 IMPORTANT: ignore pure comments or whitespace-only prefixes
  if (before.trim().length === 0) {
    return { code: line, comment: null };
  }

  // 🚨 check if there's actual code-like content before the comment
  const isCodeLike = /[a-zA-Z0-9_{}()\[\]=<>]/.test(before);

  if (!isCodeLike) {
    return { code: line, comment: null };
  }

  return {
    code: before,
    comment: line.slice(idx),
  };
}

function padToColumn(text: string, column: number): string {
  const current = text.length;

  if (current >= column) {
    return text + " ";
  }

  return text + " ".repeat(column - current);
}

export function alignTrailingComments(
  input: string,
  offset: number = 10,
): string {
  const lines = input.split("\n");

  const parsed = lines.map(parseLine);

  // find max code length among lines that have comments
  const maxCodeLength = Math.max(
    ...parsed.filter((l) => l.comment).map((l) => l.code.trimEnd().length),
    0,
  );

  const targetColumn = maxCodeLength + offset;

  const result = parsed.map(({ code, comment }) => {
    const trimmedCode = code.replace(/\s+$/, "");

    if (!comment) return trimmedCode;

    const padded = padToColumn(trimmedCode, targetColumn);

    return padded + comment;
  });

  return result.join("\n");
}
