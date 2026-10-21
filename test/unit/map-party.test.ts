import { expect, it } from 'vitest';
import { IDENTITIES } from '../../fixtures/identities';
import { NS } from '../../src/config';
import { createContext } from '../../src/model/context';
import { mapParty, mapPartyFields } from '../../src/model/party';
import { parseXmlTree } from '../../src/xml/tree';
const party = (body: string) =>
  parseXmlTree(`<cac:Party xmlns:cbc="${NS.cbc}" xmlns:cac="${NS.cac}">${body}</cac:Party>`);

it('TC-M1-024 / FR-06 / UT-16: maps every organization, person, address and contact field', () => {
  const value = mapPartyFields(
    party(`<cac:PartyName><cbc:Name>${IDENTITIES.SUP_A.name}</cbc:Name></cac:PartyName>
    <cac:Person><cbc:FirstName>Ayşe</cbc:FirstName><cbc:MiddleName>Deneme</cbc:MiddleName><cbc:FamilyName>Örnek</cbc:FamilyName><cbc:Title>Dr.</cbc:Title><cbc:NameSuffix>Test</cbc:NameSuffix><cbc:NationalityID>TR</cbc:NationalityID><cac:IdentityDocumentReference><cbc:ID>SYNTHETIC-PASSPORT</cbc:ID></cac:IdentityDocumentReference></cac:Person>
    <cac:PartyIdentification><cbc:ID> </cbc:ID></cac:PartyIdentification><cac:PartyIdentification><cbc:ID schemeID=" vkn ">${IDENTITIES.SUP_A.taxId}</cbc:ID></cac:PartyIdentification><cac:PartyIdentification><cbc:ID schemeID="MUSTERINO"> F-0001 </cbc:ID></cac:PartyIdentification>
    <cac:PartyTaxScheme><cac:TaxScheme><cbc:Name>Örnek Vergi Dairesi</cbc:Name></cac:TaxScheme></cac:PartyTaxScheme><cbc:WebsiteURI>https://example.invalid</cbc:WebsiteURI>
    <cac:PostalAddress><cbc:ID>TEST-ADDRESS</cbc:ID><cbc:Postbox>TEST-BOX</cbc:Postbox><cbc:Room>1</cbc:Room><cbc:StreetName>Örnek Sokak</cbc:StreetName><cbc:BlockName>Örnek Blok</cbc:BlockName><cbc:BuildingName>Örnek Bina</cbc:BuildingName><cbc:BuildingNumber>1</cbc:BuildingNumber><cbc:District>Örnek Mahalle</cbc:District><cbc:CitySubdivisionName>Örnek İlçe</cbc:CitySubdivisionName><cbc:CityName>İstanbul</cbc:CityName><cbc:PostalZone>00000</cbc:PostalZone><cbc:Region>Örnek Bölge</cbc:Region><cac:Country><cbc:IdentificationCode> tr </cbc:IdentificationCode><cbc:Name>Türkiye</cbc:Name></cac:Country></cac:PostalAddress>
    <cac:Contact><cbc:Name>Ayşe Örnek</cbc:Name><cbc:Telephone>+90 000 000 00 01</cbc:Telephone><cbc:Telefax>+90 000 000 00 02</cbc:Telefax><cbc:ElectronicMail>test@example.invalid</cbc:ElectronicMail><cbc:Note>synthetic contact</cbc:Note></cac:Contact>`),
    createContext(),
  );
  expect(value).toEqual({
    name: IDENTITIES.SUP_A.name,
    displayName: IDENTITIES.SUP_A.name,
    person: {
      firstName: 'Ayşe',
      middleName: 'Deneme',
      familyName: 'Örnek',
      title: 'Dr.',
      nameSuffix: 'Test',
      nationalityId: 'TR',
      identityDocumentId: 'SYNTHETIC-PASSPORT',
    },
    identifiers: [
      { schemeId: 'vkn', value: IDENTITIES.SUP_A.taxId },
      { schemeId: 'MUSTERINO', value: 'F-0001' },
    ],
    taxOffice: 'Örnek Vergi Dairesi',
    websiteUri: 'https://example.invalid',
    address: {
      id: 'TEST-ADDRESS',
      postbox: 'TEST-BOX',
      room: '1',
      streetName: 'Örnek Sokak',
      blockName: 'Örnek Blok',
      buildingName: 'Örnek Bina',
      buildingNumber: '1',
      district: 'Örnek Mahalle',
      citySubdivisionName: 'Örnek İlçe',
      cityName: 'İstanbul',
      postalZone: '00000',
      region: 'Örnek Bölge',
      countryCode: 'TR',
      countryName: 'Türkiye',
    },
    contact: {
      name: 'Ayşe Örnek',
      telephone: '+90 000 000 00 01',
      telefax: '+90 000 000 00 02',
      email: 'test@example.invalid',
      note: 'synthetic contact',
    },
  });
});
it('TC-M1-024 / UT-16: handles person-only names and absent or empty sections', () => {
  expect(mapPartyFields(null, createContext())).toBeNull();
  expect(mapPartyFields(party(''), createContext())).toEqual({
    name: null,
    person: null,
    displayName: null,
    identifiers: [],
    taxOffice: null,
    websiteUri: null,
    address: null,
    contact: null,
  });
  expect(
    mapPartyFields(
      party(
        '<cac:Person><cbc:FirstName>Ayşe</cbc:FirstName><cbc:FamilyName>Örnek</cbc:FamilyName></cac:Person>',
      ),
      createContext(),
    )?.displayName,
  ).toBe(IDENTITIES.PER_A.name);
  const empty = mapPartyFields(
    party(
      '<cac:Person/><cac:PostalAddress/><cac:Contact/><cac:PartyIdentification><cbc:ID>F-0001</cbc:ID></cac:PartyIdentification>',
    ),
    createContext(),
  );
  expect(empty?.displayName).toBeNull();
  expect(Object.values(empty?.person ?? {})).toEqual(Array.from({ length: 7 }, () => null));
  expect(Object.values(empty?.address ?? {})).toEqual(Array.from({ length: 14 }, () => null));
  expect(Object.values(empty?.contact ?? {})).toEqual(Array.from({ length: 5 }, () => null));
  expect(empty?.identifiers).toEqual([{ schemeId: null, value: 'F-0001' }]);
});

const identifier = (value: string, scheme?: string) =>
  `<cac:PartyIdentification><cbc:ID${scheme === undefined ? '' : ` schemeID="${scheme}"`}>${value}</cbc:ID></cac:PartyIdentification>`;
it('TC-M1-025 / FR-06 / UT-16: explicit schemes win in document order, without checksum validation', () => {
  expect(mapParty(null, createContext())).toBeNull();
  const context = createContext();
  const result = mapParty(
    party(
      identifier(IDENTITIES.PER_A.taxId) +
        identifier('F-0001', 'MUSTERINO') +
        identifier(IDENTITIES.BAD_VKN.taxId, 'VKN') +
        identifier(IDENTITIES.PER_A.taxId, 'TCKN'),
    ),
    context,
  );
  expect(result?.taxId).toEqual({
    scheme: 'VKN',
    value: IDENTITIES.BAD_VKN.taxId,
    schemeRaw: 'VKN',
    inferred: false,
  });
  expect(context.issues).toEqual([]);
  expect(mapParty(party(identifier(IDENTITIES.BAD_TCKN.taxId, 'TCKN')), createContext())?.taxId).toEqual({
    scheme: 'TCKN',
    value: IDENTITIES.BAD_TCKN.taxId,
    schemeRaw: 'TCKN',
    inferred: false,
  });
});
it('TC-M1-025 / UT-16: lower-case diagnostics use the filtered identifier index and combined details', () => {
  const context = createContext();
  context.path = '/Invoice/cac:AccountingSupplierParty/cac:Party';
  const value = IDENTITIES.SUP_A.taxId;
  const result = mapParty(
    party(
      identifier(' ') +
        identifier('F-0001', 'MUSTERINO') +
        identifier(`${value.slice(0, 3)} ${value.slice(3)}`, 'vkn'),
    ),
    context,
  );
  expect(result?.taxId).toEqual({ scheme: 'VKN', value, schemeRaw: 'vkn', inferred: false });
  expect(context.issues).toEqual([
    {
      code: 'EF015',
      severity: 'info',
      path: '/Invoice/cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification[2]/cbc:ID',
      message: 'schemeID vkn is not upper-case; it was read as VKN.',
      messageTr: 'schemeID vkn büyük harfle yazılmamış; VKN olarak okundu.',
      details: { reason: 'case', value, scheme: 'VKN', schemeId: 'vkn' },
    },
  ]);
});
it('TC-M1-025 / UT-16: missing schemes infer by length only, and unknown schemes are never inferred', () => {
  for (const [value, scheme] of [
    [IDENTITIES.SUP_A.taxId, 'VKN'],
    [IDENTITIES.PER_A.taxId, 'TCKN'],
  ] as const) {
    const context = createContext();
    expect(
      mapParty(party(identifier(value, 'MUSTERINO') + identifier('F-0001') + identifier(value)), context)
        ?.taxId,
    ).toEqual({ scheme, value, schemeRaw: null, inferred: true });
    expect(context.issues).toEqual([
      {
        code: 'EF015',
        severity: 'info',
        path: '/Invoice/cac:PartyIdentification[3]/cbc:ID',
        message: `Identifier ${value} has no schemeID; it was read as ${scheme} from its length.`,
        messageTr: `${value} tanımlayıcısında schemeID yok; uzunluğundan ${scheme} olarak okundu.`,
        details: { reason: 'missing', value, scheme },
      },
    ]);
  }
  const context = createContext();
  expect(
    mapParty(party(identifier(IDENTITIES.SUP_A.taxId, 'OTHER') + identifier('F-0001')), context)?.taxId,
  ).toBeNull();
  expect(mapParty(party(''), context)?.taxId).toBeNull();
  expect(context.issues).toEqual([]);
});
