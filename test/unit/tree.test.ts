import { afterEach, expect, it, vi } from 'vitest';
import { NS } from '../../src/config';
import { parseXmlTree } from '../../src/xml/tree';
import { xmlParser } from '../../src/xml/fxp';
import { attr, child, children, text, textOf } from '../../src/xml/query';
import { namespaceActual, namespaceIssues } from '../../src/xml/namespaces';
import type { NamespaceEvent } from '../../src/xml/namespaces';
import { elementPath } from '../../src/xml/path';

afterEach(() => vi.restoreAllMocks());
it('TC-M1-012 / UT-07: prefixes and default namespaces resolve to equivalent trees', () => {
  const inputs = [
    `<Invoice xmlns="${NS.inv}" xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}"><cac:Party><cbc:ID schemeID="test"> A </cbc:ID></cac:Party></Invoice>`,
    `<Invoice xmlns="${NS.inv}" xmlns:b="${NS.cbc}" xmlns:a="${NS.cac}"><a:Party><b:ID schemeID="test"> A </b:ID></a:Party></Invoice>`,
    `<Invoice xmlns="${NS.inv}"><Party xmlns="${NS.cac}"><ID xmlns="${NS.cbc}" schemeID="test"> A </ID></Party></Invoice>`,
  ];
  const trees = inputs.map(parseXmlTree);
  const canonical = (value: unknown): unknown =>
    JSON.parse(JSON.stringify(value, (key: string, v: unknown) => (key === 'prefix' ? null : v))) as unknown;
  expect(canonical(trees[0])).toEqual(canonical(trees[1]));
  expect(canonical(trees[0])).toEqual(canonical(trees[2]));
  expect(trees[0]?.attrs).toEqual({});
  const scoped = parseXmlTree(
    `<Invoice xmlns="${NS.inv}" xmlns:b="${NS.cbc}"><b:ID>A</b:ID><Group xmlns:b="urn:other"><b:ID>B</b:ID></Group><b:ID>C</b:ID><Empty xmlns=""/></Invoice>`,
  );
  expect(scoped.children.map((node) => node.ns)).toEqual([NS.cbc, NS.inv, NS.cbc, null]);
  expect(scoped.children[1]?.children[0]?.ns).toBe('urn:other');
});
it('TC-M1-013 / UT-07: strict matches win; tolerant namespace pairs deduplicate at the first path', () => {
  const root = parseXmlTree(
    `<Invoice xmlns:c="${NS.cbc}"><ID>A</ID><x:ID>B</x:ID><c:ID>C</c:ID><Note xmlns="urn:wrong">first</Note><Note xmlns="urn:wrong">second</Note></Invoice>`,
  );
  const events: NamespaceEvent[] = [];
  const context = { path: '/Invoice', events };
  expect(textOf(root, 'cbc', 'ID', context)).toBe('C');
  expect(events).toEqual([]);
  expect(children(root, 'cbc', 'Note', context)).toHaveLength(2);
  expect(namespaceIssues(events)).toEqual([
    {
      code: 'EF009',
      severity: 'warning',
      path: '/Invoice/cbc:Note[1]',
      message: `Element is not in the expected namespace ${NS.cbc}; it was matched by its local name.`,
      messageTr: `Eleman beklenen ${NS.cbc} ad alanında değil; yerel adıyla eşleştirildi.`,
      details: { expected: NS.cbc, actual: 'urn:wrong' },
    },
  ]);
  const fallback = parseXmlTree('<Invoice><x:ID>A</x:ID><ID>B</ID></Invoice>');
  expect(children(fallback, 'cbc', 'ID', context)).toHaveLength(2);
  expect(namespaceIssues(events).map((issue) => issue.details.actual)).toEqual([
    'urn:wrong',
    'prefix:x',
    'none',
  ]);
  expect(namespaceActual(root)).toBe('none');
  expect(children(null, 'cbc', 'ID')).toEqual([]);
  expect(child(root, 'cbc', 'Missing')).toBeNull();
  expect(elementPath('/Invoice', 'cac', 'Party')).toBe('/Invoice/cac:Party');
});
it('TC-M1-014 / UT-07: direct text, entity single pass, CDATA and attributes', () => {
  const root = parseXmlTree(
    '<Invoice><!-- omitted -->\n<A data="&quot;&apos;&amp;lt;">&amp;lt; &#231; &#xE7; &lt;&gt;&quot;&apos; &foo; &#0; &#xD800; &#x110000;</A>\n<B><![CDATA[&amp;]]></B>\n</Invoice>',
  );
  expect(root.text).toBe('');
  expect(root.children[0]?.text).toBe('&lt; ç ç <>"\' &foo; &#0; &#xD800; &#x110000;');
  expect(root.children[0]?.attrs).toEqual({ data: '"\'&lt;' });
  expect(root.children[1]?.text).toBe('&amp;');
  expect(parseXmlTree('<A>&#9;&#10;&#13;&#x20;&#xE000;&#x10000;</A>').text).toBe('\t\n\r \ue000\u{10000}');
  const mixed = parseXmlTree('<A>before<B/> \n<C/><![CDATA[ ]]><D/>after</A>');
  expect(mixed.text).toBe('before after');
  expect(text(parseXmlTree('<A>  x  y </A>'))).toBe('x  y');
  expect(text(parseXmlTree('<A> </A>'))).toBeNull();
  expect(text(null)).toBeNull();
  expect(attr(parseXmlTree('<A value=" x " empty=" "/>'), 'value')).toBe('x');
  expect(attr(parseXmlTree('<A empty=" "/>'), 'empty')).toBeNull();
  expect(attr(null, 'value')).toBeNull();
});
it('TC-M1-015 / UT-07: builds 10000 levels without recursion', () => {
  let node = parseXmlTree('<A>'.repeat(10000) + '</A>'.repeat(10000));
  let count = 1;
  while (node.children[0]) {
    node = node.children[0];
    count++;
  }
  expect(count).toBe(10000);
});
it('TC-M1-011 / FR-04: parser exceptions and missing root become NOT_XML', () => {
  expect(() => parseXmlTree('<!-- no root -->')).toThrow(
    expect.objectContaining({ code: 'NOT_XML', details: { line: 1, column: 1, reason: 'No root element' } }),
  );
  vi.spyOn(xmlParser, 'parse').mockImplementationOnce(() => {
    throw new Error('parser failure');
  });
  expect(() => parseXmlTree('<Invoice/>')).toThrow(
    expect.objectContaining({ code: 'NOT_XML', details: { line: 1, column: 1, reason: 'parser failure' } }),
  );
  vi.spyOn(xmlParser, 'parse').mockImplementationOnce(() => {
    // Exercise the required boundary around arbitrary third-party parser exceptions.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw 'parser failure';
  });
  expect(() => parseXmlTree('<Invoice/>')).toThrow(expect.objectContaining({ code: 'NOT_XML' }));
});
