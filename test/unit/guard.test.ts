import { expect, it } from 'vitest';
import { guardXml } from '../../src/xml/guard';
import { xmlParser } from '../../src/xml/fxp';

it('TC-M1-011 / UT-06: malformed and empty XML diagnostics', () => {
  for (const text of ['', ' \n\t\ufeff'])
    expect(() => {
      guardXml(text);
    }).toThrow(expect.objectContaining({ code: 'EMPTY_INPUT' }));
  expect(() => {
    guardXml('<Invoice>');
  }).toThrow(
    expect.objectContaining({
      code: 'NOT_XML',
      details: { line: 1, column: 1, reason: "Unclosed tag 'Invoice'." },
    }),
  );
  expect(() => {
    guardXml('<Invoice flag/>');
  }).toThrow(expect.objectContaining({ code: 'NOT_XML' }));
  expect(() => {
    guardXml('<Invoice/>');
  }).not.toThrow();
});
it.each([
  '<!DOCTYPE Invoice><Invoice/>',
  '<?xml version="1.0"?><!-- comment --> \n<!doctype Invoice><Invoice/>',
  '<Invoice><!DoCtYpE Invoice></Invoice>',
  '<Invoice><!ENTITY x "text"></Invoice>',
])('TC-M1-011 / UT-06: rejects declarations outside comments and CDATA (%s)', (xml) => {
  expect(() => {
    guardXml(xml);
  }).toThrow(expect.objectContaining({ code: 'DOCTYPE_FORBIDDEN' }));
});
it('TC-M1-011 / UT-06: permits declaration-like text in comments and CDATA', () => {
  expect(() => {
    guardXml('<!-- <!DOCTYPE Invoice> --><Invoice><![CDATA[<!DOCTYPE Invoice><!ENTITY x>]]></Invoice>');
  }).not.toThrow();
  for (const text of ['<!-- unclosed', '<Invoice><![CDATA[unclosed', '<?unclosed'])
    expect(() => {
      guardXml(text);
    }).toThrow(expect.objectContaining({ code: 'NOT_XML' }));
});
it('TC-M1-011 / NFR-12: rejects a 1000-level billion-laughs declaration before parsing', () => {
  const xml =
    '<!DOCTYPE Invoice [' +
    Array.from(
      { length: 1000 },
      (_, i) => `<!ENTITY e${String(i)} "&e${String(i + 1)};&e${String(i + 1)};">`,
    ).join('') +
    ']><Invoice>&e0;</Invoice>';
  const start = performance.now();
  expect(() => {
    guardXml(xml);
  }).toThrow(expect.objectContaining({ code: 'DOCTYPE_FORBIDDEN' }));
  expect(performance.now() - start).toBeLessThan(10);
});
it('TC-M1-008 / A-14: pinned parser retains ordered strings, namespaces and raw entities', () => {
  const result: unknown = xmlParser.parse(
    '<Invoice xmlns="urn:example"><ID code="0015">1180.10&amp;lt;</ID><![CDATA[&amp;]]></Invoice>',
  );
  expect(result).toEqual([
    {
      Invoice: [
        { ID: [{ '#text': '1180.10&amp;lt;' }], ':@': { code: '0015' } },
        { '#cdata': [{ '#text': '&amp;' }] },
      ],
      ':@': { xmlns: 'urn:example' },
    },
  ]);
});
