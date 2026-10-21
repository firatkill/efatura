import { expect, it } from 'vitest';
import { IDENTITIES } from '../../fixtures/identities';
import { NS } from '../../src/config';
import { createContext } from '../../src/model/context';
import { mapPartyFields } from '../../src/model/party';
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
