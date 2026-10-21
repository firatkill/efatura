import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

function read(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
}

function source(path: string): ts.SourceFile {
  return ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true);
}

function strings(node: ts.Node): string[] {
  const result: string[] = [];
  function visit(child: ts.Node) {
    if (ts.isStringLiteralLike(child)) result.push(child.text);
    ts.forEachChild(child, visit);
  }
  visit(node);
  return result;
}

function readTree(path: string): string {
  if (!existsSync(path)) return '';
  return readdirSync(path, { withFileTypes: true })
    .map((entry) => (entry.isDirectory() ? readTree(join(path, entry.name)) : read(join(path, entry.name))))
    .join('\n');
}

function table(text: string): string[][] {
  return text
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((cell) => cell.trim()),
    );
}

function literalProperties(file: ts.SourceFile): Map<string, string> {
  const result = new Map<string, string>();
  function visit(node: ts.Node) {
    if (ts.isPropertyAssignment(node) && ts.isStringLiteralLike(node.initializer)) {
      const name = ts.isStringLiteralLike(node.name) || ts.isIdentifier(node.name) ? node.name.text : '';
      result.set(name, node.initializer.text);
    }
    ts.forEachChild(node, visit);
  }
  visit(file);
  return result;
}

/**
 * Verify public export documentation and specification parity.
 * @example
 * const problems = checkDocs(process.cwd());
 */
export function checkDocs(root: string): string[] {
  const problems: string[] = [];
  for (const entry of ['src/index.ts', 'src/zip.ts']) {
    const file = source(join(root, entry));
    for (const statement of file.statements) {
      const exported =
        ts.isExportDeclaration(statement) ||
        (ts.canHaveModifiers(statement) &&
          ts.getModifiers(statement)?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword));
      if (!exported) continue;
      if (
        ts.isExportDeclaration(statement) &&
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause) &&
        !statement.exportClause.elements.length
      )
        continue;
      const comments = file.text.slice(statement.getFullStart(), statement.getStart(file));
      if (!/\/\*\*[\s\S]*?@example\b[\s\S]*?\*\//.test(comments)) {
        problems.push(
          `${entry}: export lacks TSDoc with @example: ${statement.getText(file).split('\n')[0] ?? ''}`,
        );
      }
    }
  }

  const trd = read(join(root, 'docs/TRD.md'));
  const catalogue = source(join(root, 'src/validate/catalogue.ts'));
  const codes = new Set(strings(catalogue).filter((value) => /^EF\d{3}$/.test(value)));
  const tests = readTree(join(root, 'test/unit/validate'));
  const scenarios = readTree(join(root, 'fixtures/scenarios'));
  for (const code of codes) {
    if (!trd.includes(code)) problems.push(`${code}: missing from TRD`);
    if (!tests.includes(code)) problems.push(`${code}: missing validation test`);
    if (!new RegExp(`${code}:(error|warning|info)`).test(scenarios))
      problems.push(`${code}: missing fixture expectation`);
  }
  // T-17 extends catalogue checks for its concrete variant representation.
  const messageRows = table(trd).filter(([code]) => /^EF\d{3}/.test(code ?? ''));
  const messages = new Set(messageRows.flatMap((row) => row.slice(1)));
  function checkMessages(node: ts.Node) {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteralLike(node.initializer) &&
      ['message', 'messageTr'].includes(node.name.getText(catalogue).replace(/['"]/g, '')) &&
      !messages.has(node.initializer.text)
    ) {
      problems.push(`Catalogue message differs from TRD: ${node.initializer.text}`);
    }
    ts.forEachChild(node, checkMessages);
  }
  checkMessages(catalogue);

  const copyRows = table(read(join(root, 'docs/PRD.md')));
  const en = literalProperties(source(join(root, 'playground/src/i18n/en.ts')));
  const tr = literalProperties(source(join(root, 'playground/src/i18n/tr.ts')));
  for (const key of new Set([...en.keys(), ...tr.keys()])) {
    const row = copyRows.find(([label]) => label?.match(/`([^`]+)`/)?.[1] === key);
    if (!row || en.get(key) !== row[1] || tr.get(key) !== row[2])
      problems.push(`UI copy differs from PRD: ${key}`);
  }

  const readmes = ['README.md', 'README.tr.md'].map((path) => read(join(root, path)));
  function structure(text: string) {
    return {
      headings: (text.match(/^## /gm) ?? []).length,
      blocks: [...text.matchAll(/^```[^\n]*\n([\s\S]*?)^```/gm)].map((match) => match[1]),
    };
  }
  if (readmes.some((text) => !text)) problems.push('Both READMEs are required.');
  if (JSON.stringify(structure(readmes[0] ?? '')) !== JSON.stringify(structure(readmes[1] ?? ''))) {
    problems.push('README heading counts or code blocks differ.');
  }
  return problems;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const problems = checkDocs(process.cwd());
  if (problems.length) {
    console.error(problems.join('\n'));
    process.exitCode = 1;
  } else console.log('Documentation parity checks passed.');
}
