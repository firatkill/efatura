import { expect, it } from 'vitest';
import { NS } from '../../src/config';
import { createContext } from '../../src/model/context';
import { mapIdentity } from '../../src/model/identity';
import { mapReferences } from '../../src/model/references';
import { parseXmlTree } from '../../src/xml/tree';
const root = (body: string) =>
  parseXmlTree(
    `<Invoice xmlns="${NS.inv}" xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}" xmlns:ext="${NS.ext}" xmlns:ds="${NS.ds}">${body}</Invoice>`,
  );

it('TC-M1-020 / FR-05 / UT-14: maps every identity field without changing raw code case', () => {
  expect(
    mapIdentity(
      root(`<cbc:UBLVersionID> 2.1 </cbc:UBLVersionID><cbc:CustomizationID>TR1.2.1</cbc:CustomizationID>
    <cbc:ProfileID> temelFatura </cbc:ProfileID><cbc:ID>SYN2025000000001</cbc:ID><cbc:CopyIndicator>1</cbc:CopyIndicator>
    <cbc:UUID>ABCDEFAB-0000-4000-8000-000000000001</cbc:UUID><cbc:IssueDate>2025-11-29</cbc:IssueDate><cbc:IssueTime>12:34:56</cbc:IssueTime>
    <cbc:InvoiceTypeCode> satis </cbc:InvoiceTypeCode><cbc:Note> first  note </cbc:Note><cbc:Note> </cbc:Note><cbc:Note>second</cbc:Note>
    <cbc:DocumentCurrencyCode> try </cbc:DocumentCurrencyCode><cbc:LineCountNumeric>02</cbc:LineCountNumeric>
    <cac:InvoicePeriod><cbc:StartDate>2025-11-01</cbc:StartDate><cbc:EndDate>2025-11-30</cbc:EndDate><cbc:Description> November </cbc:Description></cac:InvoicePeriod>`),
      createContext(),
    ),
  ).toEqual({
    ublVersionId: '2.1',
    customizationId: 'TR1.2.1',
    profileIdRaw: 'temelFatura',
    profileId: 'TEMELFATURA',
    number: 'SYN2025000000001',
    copyIndicator: true,
    uuid: 'ABCDEFAB-0000-4000-8000-000000000001',
    issueDate: '2025-11-29',
    issueTime: '12:34:56',
    typeCodeRaw: 'satis',
    typeCode: 'SATIS',
    notes: ['first  note', 'second'],
    currency: 'TRY',
    lineCountNumeric: 2,
    period: { startDate: '2025-11-01', endDate: '2025-11-30', description: 'November' },
    signed: false,
  });
});
it('TC-M1-020 / UT-14: absent fields and unknown codes remain lossless', () => {
  const empty = mapIdentity(root(''), createContext());
  expect(empty).toEqual({
    ublVersionId: null,
    customizationId: null,
    profileIdRaw: null,
    profileId: 'OTHER',
    number: null,
    copyIndicator: null,
    uuid: null,
    issueDate: null,
    issueTime: null,
    typeCodeRaw: null,
    typeCode: 'OTHER',
    notes: [],
    currency: null,
    lineCountNumeric: null,
    period: null,
    signed: false,
  });
  const context = createContext();
  const value = mapIdentity(
    root(
      '<cbc:ProfileID>NewProfile</cbc:ProfileID><cbc:InvoiceTypeCode>NewType</cbc:InvoiceTypeCode><cbc:LineCountNumeric>1.2</cbc:LineCountNumeric><cac:InvoicePeriod/>',
    ),
    context,
  );
  expect(value).toMatchObject({
    profileIdRaw: 'NewProfile',
    profileId: 'OTHER',
    typeCodeRaw: 'NewType',
    typeCode: 'OTHER',
    lineCountNumeric: null,
    period: { startDate: null, endDate: null, description: null },
  });
  expect(context.issues).toEqual([
    {
      code: 'EF030',
      severity: 'error',
      path: '/Invoice/cbc:LineCountNumeric',
      message: '1.2 is not a valid number.',
      messageTr: '1.2 geçerli bir sayı değil.',
      details: { value: '1.2' },
    },
  ]);
});
it('TC-M1-020 / UT-14: signed requires a ds:Signature below ext:UBLExtensions', () => {
  expect(
    mapIdentity(
      root(
        '<ext:UBLExtensions><ext:UBLExtension><ext:ExtensionContent><ds:Signature/></ext:ExtensionContent></ext:UBLExtension></ext:UBLExtensions>',
      ),
      createContext(),
    ).signed,
  ).toBe(true);
  for (const xml of [
    '<ds:Signature/>',
    '<ext:UBLExtensions><Signature/></ext:UBLExtensions>',
    '<UBLExtensions><ds:Signature/></UBLExtensions>',
  ])
    expect(mapIdentity(root(xml), createContext()).signed).toBe(false);
});
it('TC-M1-020 / UT-14: maps all reference collections and separates embedded attachments', () => {
  const fields =
    '<cbc:ID>REF-A</cbc:ID><cbc:IssueDate>2025-11-01</cbc:IssueDate><cbc:DocumentTypeCode>other</cbc:DocumentTypeCode><cbc:DocumentType>Agreement</cbc:DocumentType><cbc:DocumentDescription> first </cbc:DocumentDescription><cbc:DocumentDescription> </cbc:DocumentDescription><cbc:DocumentDescription>second</cbc:DocumentDescription>';
  const value = mapReferences(
    root(`<cac:OrderReference>${fields}</cac:OrderReference><cac:BillingReference><cac:InvoiceDocumentReference>${fields}</cac:InvoiceDocumentReference></cac:BillingReference><cac:BillingReference/>
    <cac:DespatchDocumentReference>${fields}</cac:DespatchDocumentReference><cac:ReceiptDocumentReference>${fields}</cac:ReceiptDocumentReference><cac:ContractDocumentReference>${fields}</cac:ContractDocumentReference>
    <cac:AdditionalDocumentReference>${fields}</cac:AdditionalDocumentReference><cac:AdditionalDocumentReference><cbc:ID>external</cbc:ID><cac:Attachment><cac:ExternalReference><cbc:URI>https://example.invalid/document</cbc:URI></cac:ExternalReference></cac:Attachment></cac:AdditionalDocumentReference>
    <cac:AdditionalDocumentReference><cbc:ID>embedded</cbc:ID><cac:Attachment><cbc:EmbeddedDocumentBinaryObject/></cac:Attachment></cac:AdditionalDocumentReference>`),
    createContext(),
  );
  const expected = {
    id: 'REF-A',
    issueDate: '2025-11-01',
    documentTypeCode: 'other',
    documentType: 'Agreement',
    descriptions: ['first', 'second'],
  };
  for (const key of [
    'orderReferences',
    'billingReferences',
    'despatchReferences',
    'receiptReferences',
    'contractReferences',
  ] as const)
    expect(value[key]).toEqual([expected]);
  expect(value.additionalReferences).toEqual([
    expected,
    { id: 'external', issueDate: null, documentTypeCode: null, documentType: null, descriptions: [] },
  ]);
  expect(Object.values(mapReferences(root(''), createContext()))).toEqual([[], [], [], [], [], []]);
});
