import { createIssue } from '../validate/issue';
import type { Address, Contact, Party, PersonName } from '../types';
import type { XmlElement } from '../xml/tree';
import { attr, child, children, text, textOf } from '../xml/query';
import { at } from './context';
import type { MappingContext } from './context';
import { code } from './values';

/** Map the shared address structure (TRD §7.5).
 * @example
 * mapAddress(null, context); // null
 */
export function mapAddress(el: XmlElement | null, context: MappingContext): Address | null {
  if (!el) return null;
  const read = (name: string) => textOf(el, 'cbc', name, context);
  const country = child(el, 'cac', 'Country', context);
  const countryContext = at(context, 'cac', 'Country');
  return {
    id: read('ID'),
    postbox: read('Postbox'),
    room: read('Room'),
    streetName: read('StreetName'),
    blockName: read('BlockName'),
    buildingName: read('BuildingName'),
    buildingNumber: read('BuildingNumber'),
    district: read('District'),
    citySubdivisionName: read('CitySubdivisionName'),
    cityName: read('CityName'),
    postalZone: read('PostalZone'),
    region: read('Region'),
    countryCode: code(child(country, 'cbc', 'IdentificationCode', countryContext)),
    countryName: textOf(country, 'cbc', 'Name', countryContext),
  };
}
function person(el: XmlElement | null, context: MappingContext): PersonName | null {
  if (!el) return null;
  const read = (name: string) => textOf(el, 'cbc', name, context);
  return {
    firstName: read('FirstName'),
    middleName: read('MiddleName'),
    familyName: read('FamilyName'),
    title: read('Title'),
    nameSuffix: read('NameSuffix'),
    nationalityId: read('NationalityID'),
    identityDocumentId: textOf(
      child(el, 'cac', 'IdentityDocumentReference', context),
      'cbc',
      'ID',
      at(context, 'cac', 'IdentityDocumentReference'),
    ),
  };
}
function contact(el: XmlElement | null, context: MappingContext): Contact | null {
  if (!el) return null;
  return {
    name: textOf(el, 'cbc', 'Name', context),
    telephone: textOf(el, 'cbc', 'Telephone', context),
    telefax: textOf(el, 'cbc', 'Telefax', context),
    email: textOf(el, 'cbc', 'ElectronicMail', context),
    note: textOf(el, 'cbc', 'Note', context),
  };
}

/** Read party fields before resolving the tax identifier (TRD §7.5).
 * @example
 * mapPartyFields(partyElement, context)?.displayName;
 */
export function mapPartyFields(el: XmlElement | null, context: MappingContext): Omit<Party, 'taxId'> | null {
  if (!el) return null;
  const name = textOf(child(el, 'cac', 'PartyName', context), 'cbc', 'Name', at(context, 'cac', 'PartyName'));
  const personName = person(child(el, 'cac', 'Person', context), at(context, 'cac', 'Person'));
  const fullName = personName
    ? [personName.firstName, personName.middleName, personName.familyName].filter((v) => v !== null).join(' ')
    : '';
  const tax = child(el, 'cac', 'PartyTaxScheme', context);
  const taxContext = at(context, 'cac', 'PartyTaxScheme');
  return {
    name,
    person: personName,
    displayName: name ?? (fullName || null),
    identifiers: children(el, 'cac', 'PartyIdentification', context).flatMap((identifier, i) => {
      const id = child(identifier, 'cbc', 'ID', at(context, 'cac', 'PartyIdentification', i + 1));
      const value = text(id);
      return value === null ? [] : [{ schemeId: attr(id, 'schemeID'), value }];
    }),
    taxOffice: textOf(
      child(tax, 'cac', 'TaxScheme', taxContext),
      'cbc',
      'Name',
      at(taxContext, 'cac', 'TaxScheme'),
    ),
    websiteUri: textOf(el, 'cbc', 'WebsiteURI', context),
    address: mapAddress(child(el, 'cac', 'PostalAddress', context), at(context, 'cac', 'PostalAddress')),
    contact: contact(child(el, 'cac', 'Contact', context), at(context, 'cac', 'Contact')),
  };
}

/** Resolve a party's tax identifier without applying checksum validation (TRD §7.5.1).
 * @example
 * mapParty(partyElement, context)?.taxId?.scheme; // 'VKN'
 */
export function mapParty(el: XmlElement | null, context: MappingContext): Party | null {
  const fields = mapPartyFields(el, context);
  if (!fields) return null;
  for (const [i, identifier] of fields.identifiers.entries()) {
    const schemeId = identifier.schemeId;
    if (schemeId === null) continue;
    const scheme = schemeId.toUpperCase();
    if (scheme !== 'VKN' && scheme !== 'TCKN') continue;
    const value = identifier.value.replace(/\s+/g, '');
    if (identifier.schemeId !== scheme) {
      context.issues.push(
        createIssue(
          'EF015',
          at(at(context, 'cac', 'PartyIdentification', i + 1), 'cbc', 'ID').path,
          { schemeId, scheme },
          { reason: 'case', value, scheme, schemeId },
          'case',
        ),
      );
    }
    return { ...fields, taxId: { scheme, value, schemeRaw: identifier.schemeId, inferred: false } };
  }
  for (const [i, identifier] of fields.identifiers.entries()) {
    if (identifier.schemeId !== null) continue;
    const value = identifier.value.replace(/\s+/g, '');
    const scheme = /^\d{10}$/.test(value) ? 'VKN' : /^\d{11}$/.test(value) ? 'TCKN' : null;
    if (scheme === null) continue;
    context.issues.push(
      createIssue(
        'EF015',
        at(at(context, 'cac', 'PartyIdentification', i + 1), 'cbc', 'ID').path,
        { value, scheme },
        { reason: 'missing', value, scheme },
        'missing',
      ),
    );
    return { ...fields, taxId: { scheme, value, schemeRaw: null, inferred: true } };
  }
  return { ...fields, taxId: null };
}
