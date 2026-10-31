// Finds user-facing text written straight into a TSX component instead of coming from a copy
// object (AC-10: every string a visitor sees must pass the promise check, see formCopy.test.ts).
// It walks the TypeScript syntax tree, so it sees text however it is written: JSX text, a string
// or template literal in braces, a ternary or && branch, a string a .map() callback returns, a
// text-bearing attribute in any quote form, or a const / let (in any scope, or a field of an object
// literal) used in one of those.
import ts from "typescript";

// Attributes and props whose value a visitor sees or a screen reader speaks.
const TEXT_ATTRIBUTES = new Set([
  "alt",
  "title",
  "placeholder",
  "label",
  "hint",
  "error",
  "aria-label",
  "aria-description",
  "aria-roledescription",
  "aria-valuetext",
  "aria-placeholder",
]);

// Text a visitor reads: any letter, digit or currency sign (a bare "₴500" is a price) once HTML
// entities such as &nbsp; are taken out.
const hasText = (text: string) => /[\p{L}\p{N}\p{Sc}]/u.test(text.replace(/&(?:[a-z]+|#\d+|#x[\da-f]+);/gi, ""));

// Returns each hard-coded user-facing string found in the source, in source order.
export function hardCodedText(source: string): string[] {
  const file = ts.createSourceFile("component.tsx", source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found: string[] = [];

  // Every `const` / `let NAME = …` in any scope: rendering {NAME} renders what it was set to. A name
  // declared in several scopes keeps all its initializers, so each one is checked.
  const declared = new Map<string, ts.Expression[]>();
  const collect = (node: ts.Node): void => {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      declared.set(node.name.text, [...(declared.get(node.name.text) ?? []), node.initializer]);
    }
    ts.forEachChild(node, collect);
  };
  collect(file);

  // The expressions a name or a field path (T.a.b) of a local object literal stands for.
  const valuesOf = (node: ts.Expression): ts.Expression[] => {
    if (ts.isIdentifier(node)) return declared.get(node.text) ?? [];
    if (ts.isPropertyAccessExpression(node)) {
      return valuesOf(node.expression).flatMap((value) => {
        if (!ts.isObjectLiteralExpression(value)) return [];
        return value.properties.flatMap((prop) =>
          ts.isPropertyAssignment(prop) && prop.name.getText(file) === node.name.text ? [prop.initializer] : [],
        );
      });
    }
    return [];
  };
  const resolving = new Set<ts.Node>();

  // An expression whose value ends up on screen: report the text it can produce.
  const rendered = (node: ts.Expression): void => {
    if (ts.isStringLiteralLike(node)) {
      if (hasText(node.text)) found.push(node.text);
    } else if (ts.isTemplateExpression(node)) {
      const parts = [node.head.text, ...node.templateSpans.map((span) => span.literal.text)];
      if (parts.some(hasText)) found.push(node.getText(file));
    } else if (ts.isIdentifier(node) || ts.isPropertyAccessExpression(node)) {
      for (const value of valuesOf(node)) {
        if (resolving.has(value)) continue; // const a = b; const b = a;
        resolving.add(value);
        rendered(value);
        resolving.delete(value);
      }
    } else if (ts.isParenthesizedExpression(node) || ts.isAsExpression(node) || ts.isNonNullExpression(node)) {
      rendered(node.expression);
    } else if (ts.isConditionalExpression(node)) {
      rendered(node.whenTrue);
      rendered(node.whenFalse);
    } else if (ts.isBinaryExpression(node)) {
      const op = node.operatorToken.kind;
      if (op === ts.SyntaxKind.AmpersandAmpersandToken) rendered(node.right);
      else if (op === ts.SyntaxKind.BarBarToken || op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.PlusToken) {
        rendered(node.left);
        rendered(node.right);
      }
    } else if (ts.isArrayLiteralExpression(node)) {
      node.elements.forEach(rendered);
    } else if (ts.isCallExpression(node)) {
      // xs.map(() => "text"): what a callback returns is rendered; plain arguments are not.
      if (ts.isPropertyAccessExpression(node.expression)) rendered(node.expression.expression);
      for (const arg of node.arguments) if (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg)) returned(arg);
    }
    // Anything else (JSX, an imported COPY.line, calls of copy functions) is either visited on its
    // own or comes from elsewhere.
  };

  const returned = (fn: ts.ArrowFunction | ts.FunctionExpression): void => {
    if (!ts.isBlock(fn.body)) return rendered(fn.body);
    const visit = (node: ts.Node): void => {
      if (ts.isReturnStatement(node) && node.expression) rendered(node.expression);
      else if (!ts.isFunctionLike(node)) ts.forEachChild(node, visit);
    };
    ts.forEachChild(fn.body, visit);
  };

  const visit = (node: ts.Node): void => {
    if (ts.isJsxText(node)) {
      const text = node.text.trim();
      if (hasText(text)) found.push(text);
    } else if (ts.isJsxExpression(node) && node.expression && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      rendered(node.expression);
    } else if (ts.isJsxAttribute(node) && TEXT_ATTRIBUTES.has(node.name.getText(file)) && node.initializer) {
      const init = node.initializer;
      if (ts.isStringLiteral(init)) rendered(init);
      else if (ts.isJsxExpression(init) && init.expression) rendered(init.expression);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return found;
}
