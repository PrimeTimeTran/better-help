import { parse } from "@babel/parser";
import traverse, { VisitNode } from "@babel/traverse";
import generate from "@babel/generator";
import * as t from "@babel/types";

function normalizeClassString(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}

type JSXAttributeProps = VisitNode<t.Node, t.JSXAttribute> | undefined;

export function transformClassNames(code: string): string {
  const ast = parse(code, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  traverse(ast, {
    JSXAttribute(path): JSXAttributeProps {
      const name = path.node.name;

      if (!t.isJSXIdentifier(name) || name.name !== "className") return;

      const value = path.node.value;

      if (!t.isStringLiteral(value)) return;

      const normalized = normalizeClassString(value.value);

      if (normalized === value.value) return;

      value.value = normalized;
    },
  });

  return generate(ast, {
    retainLines: false,
    compact: false,
  }).code;
}
