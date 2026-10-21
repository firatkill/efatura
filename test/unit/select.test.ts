import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { parseXmlTree } from '../../src/xml/tree';
import { select, selectAll, selectText } from '../../src/xml/select';

const root = parseXmlTree(
  `<Invoice xmlns="${NS.inv}" xmlns:a="${NS.cac}" xmlns:b="${NS.cbc}"><a:InvoiceLine><b:ID> A </b:ID><b:ID>B</b:ID></a:InvoiceLine><a:InvoiceLine><b:ID>C</b:ID></a:InvoiceLine><ID>foreign</ID><b:Empty> </b:Empty></Invoice>`,
);
it('TC-M1-016 / UT-08 / FR-13: namespaces, wildcard, absolute prefix and indexes', () => {
  expect(selectText(root, '/Invoice/cac:InvoiceLine[1]/cbc:ID[2]')).toBe('B');
  expect(selectAll(root, 'cac:InvoiceLine/cbc:ID').map((node) => node.text.trim())).toEqual(['A', 'B', 'C']);
  expect(selectAll(root, 'cac:InvoiceLine/cbc:ID[2]').map((node) => node.text)).toEqual(['B']);
  expect(selectText(root, '*:ID')).toBe('foreign');
  expect(selectText(root, 'cbc:ID')).toBeNull();
  expect(select(root, 'cac:InvoiceLine[3]')).toBeNull();
  expect(selectText(root, 'cbc:Empty')).toBeNull();
  expect(selectAll(null, 'cbc:ID')).toEqual([]);
  expect(selectText(null, 'cbc:ID')).toBeNull();
  for (const prefix of ['ext', 'ds', 'xades', 'inv'] as const) {
    const tree = parseXmlTree(`<Invoice xmlns:x="${NS[prefix]}"><x:Node>value</x:Node></Invoice>`);
    expect(selectText(tree, `${prefix}:Node`)).toBe('value');
  }
});
it.each([
  '',
  'ID',
  'foo:ID',
  'cbc:ID[0]',
  'cbc:ID[-1]',
  'cbc:ID[1.5]',
  'cbc:ID[]',
  'cbc:ID[9007199254740992]',
  'cbc:ID/',
  '//cbc:ID',
  '/Wrong/cbc:ID',
  'cbc:ID/@value',
  'cbc:ID[1]/../cbc:ID',
])('TC-M1-016 / UT-08: rejects invalid path %j even without a root', (path) => {
  expect(() => select(null, path)).toThrow(TypeError);
});
