import { Buffer } from 'node:buffer';
import { expect, it } from 'vitest';
import fc from 'fast-check';
import { NS } from '../../src/config';
import type { Attachment, Invoice } from '../../src/types';
import { createContext } from '../../src/model/context';
import { mapAttachments } from '../../src/model/attachments';
import { decodeAttachment, attachmentText, findXslt } from '../../src/attachments/attachments';
import { parseXmlTree } from '../../src/xml/tree';
const root = (body: string) =>
  parseXmlTree(`<Invoice xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</Invoice>`);
const embedded = (attrs: string, body = 'TQ==', type = '') =>
  `<cac:AdditionalDocumentReference>${type ? `<cbc:DocumentType>${type}</cbc:DocumentType>` : ''}<cac:Attachment><cbc:EmbeddedDocumentBinaryObject ${attrs}>${body}</cbc:EmbeddedDocumentBinaryObject></cac:Attachment></cac:AdditionalDocumentReference>`;
const example = (): Attachment => ({
  id: null,
  issueDate: null,
  documentTypeCode: null,
  documentType: null,
  descriptions: [],
  filename: null,
  mimeCode: null,
  encodingCode: null,
  characterSetCode: null,
  isXslt: false,
  size: 0,
  base64: '',
  externalUri: null,
});
it('TC-M1-032 / FR-12 / UT-20: maps all reference and binary fields without fetching or decoding', () => {
  const xml = root(
    '<cac:AdditionalDocumentReference><cbc:ID>REF</cbc:ID><cbc:IssueDate>2025-12-01</cbc:IssueDate><cbc:DocumentTypeCode>TEST</cbc:DocumentTypeCode><cbc:DocumentType>xslt</cbc:DocumentType><cbc:DocumentDescription>synthetic stylesheet</cbc:DocumentDescription><cac:Attachment><cbc:EmbeddedDocumentBinaryObject filename="test.XSLT" mimeCode="TEXT/XML" encodingCode="Base64" characterSetCode="utf-8"> T W F u \n</cbc:EmbeddedDocumentBinaryObject><cac:ExternalReference><cbc:URI>https://example.invalid/view</cbc:URI></cac:ExternalReference></cac:Attachment></cac:AdditionalDocumentReference><cac:AdditionalDocumentReference/>',
  );
  const expected = {
    id: 'REF',
    issueDate: '2025-12-01',
    documentTypeCode: 'TEST',
    documentType: 'xslt',
    descriptions: ['synthetic stylesheet'],
    filename: 'test.XSLT',
    mimeCode: 'text/xml',
    encodingCode: 'Base64',
    characterSetCode: 'utf-8',
    isXslt: true,
    size: 3,
    base64: 'TWFu',
    externalUri: 'https://example.invalid/view',
  };
  expect(mapAttachments(xml, createContext())).toEqual([expected]);
  expect(mapAttachments(xml, createContext({ attachments: 'metadata' }))).toEqual([
    { ...expected, base64: null },
  ]);
  expect(mapAttachments(root(''), createContext())).toEqual([]);
  expect(mapAttachments(root(embedded('', '?')), createContext())[0]?.base64).toBe('?');
});
it.each([
  ['filename="view.xsl"', '', true],
  ['filename="view.XSLT"', '', true],
  ['', 'XSLT', true],
  ['mimeCode="application/xslt+xml"', '', true],
  ['mimeCode="text/xsl"', '', true],
  ['filename="view.xslt" mimeCode="application/pdf"', 'XSLT', false],
  ['filename="view.xslt" mimeCode="image/png"', 'XSLT', false],
  ['mimeCode="application/xml"', '', false],
  ['filename="view.xml"', '', false],
  ['', '', false],
])('TC-M1-032 / UT-20: XSLT detection %s %s', (attrs, type, expected) => {
  expect(mapAttachments(root(embedded(attrs, '', type)), createContext())[0]?.isXslt).toBe(expected);
});
it('TC-M1-033 / UT-20: lazy byte/text decoding, unavailable data and unknown encoding fallback', () => {
  const attachment = { ...example(), base64: Buffer.from('Örnek').toString('base64') };
  expect(decodeAttachment(attachment)).toEqual(new TextEncoder().encode('Örnek'));
  expect(attachmentText(attachment)).toBe('Örnek');
  expect(attachmentText({ ...attachment, characterSetCode: 'unknown-encoding' })).toBe('Örnek');
  expect(attachmentText({ ...attachment, base64: '0A==', characterSetCode: 'windows-1254' })).toBe('Ğ');
  expect(() => decodeAttachment({ ...attachment, base64: null })).toThrow(TypeError);
  expect(() => decodeAttachment({ ...attachment, base64: '?' })).toThrow(TypeError);
});
it('TC-M1-033 / UT-20: findXslt returns the first matching attachment or null', () => {
  const first = { ...example(), isXslt: true, id: 'first' },
    second = { ...example(), isXslt: true, id: 'second' };
  // Only the attachments field is relevant to this helper's unit contract.
  expect(findXslt({ attachments: [example(), first, second] } as Invoice)).toBe(first);
  expect(findXslt({ attachments: [example()] } as Invoice)).toBeNull();
});

it('TC-M1-032 / UT-20: mapped size matches decoded bytes for 100 synthetic byte arrays', () => {
  for (const bytes of fc.sample(fc.uint8Array({ maxLength: 1024 }), { seed: 5678, numRuns: 100 })) {
    const encoded = Buffer.from(bytes).toString('base64');
    const attachment = mapAttachments(root(embedded('', encoded)), createContext())[0];
    expect(attachment?.size).toBe(bytes.length);
  }
});
