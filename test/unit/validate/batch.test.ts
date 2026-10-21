import { describe, expect, it } from 'vitest';
import { parseMany } from '../../../src/index';
import { fullInvoiceXml as xml } from '../../helpers/invoice';
import { IDENTITIES } from '../../../fixtures/identities';
import { expectedIssue } from '../../helpers/validation';
const uuid = 'fea70000-0000-4000-8000-000000006001';
const file = (name: string, data = xml) => ({ name, data });
describe('T-23 / UT-31 / FR-23', () => {
  it('TC-M3-005 EF090 exact flag, case folding, negative and skip', async () => {
    const result = await parseMany(
      [file('first.xml'), file('copy.xml', xml.replace(uuid, uuid.toUpperCase()))],
      { validate: false },
    );
    expect(result.items[0]?.kind === 'invoice' && result.items[0].issues).toEqual([]);
    expect(result.items[1]?.kind === 'invoice' && result.items[1].issues).toEqual([
      {
        ...expectedIssue('EF090', '/Invoice/cbc:UUID', {
          value: uuid.toUpperCase(),
          firstSource: 'first.xml',
        }),
        details: { firstSource: 'first.xml' },
      },
    ]);
    const skipped = await parseMany([file('first.xml'), file('copy.xml')], {
      duplicates: 'skip',
      validate: false,
    });
    expect(skipped.items[1]).toMatchObject({ kind: 'duplicate', uuid, firstSource: 'first.xml' });
    expect(skipped.summary).toMatchObject({ duplicates: 1, invoices: 1 });
  });
  it('TC-M3-006 EF091 exact collision and absent prerequisites', async () => {
    const other = uuid.replace('6001', '6002');
    const result = await parseMany([file('first.xml'), file('other.xml', xml.replace(uuid, other))], {
      validate: false,
    });
    expect(result.items[1]?.kind === 'invoice' && result.items[1].issues).toEqual([
      expectedIssue('EF091', '/Invoice/cbc:ID', { number: 'ORN2025000006001', firstUuid: uuid }),
    ]);
    for (const data of [
      xml,
      xml.replace(`<cbc:UUID>${uuid}</cbc:UUID>`, ''),
      xml.replace('<cbc:ID>ORN2025000006001</cbc:ID>', ''),
    ]) {
      const single = await parseMany([file('single', data)], { validate: false });
      expect(
        single.items[0]?.kind === 'invoice' && single.items[0].issues.some((i) => i.code === 'EF091'),
      ).toBe(false);
    }
  });
  it('TC-M3-006 distinct suppliers and missing keys do not collide', async () => {
    const withoutUuid = xml.replace(`<cbc:UUID>${uuid}</cbc:UUID>`, '');
    const withoutNumber = xml.replace('<cbc:ID>ORN2025000006001</cbc:ID>', '');
    const withoutSupplier = xml.replace(
      /<cac:AccountingSupplierParty>[\s\S]*?<\/cac:AccountingSupplierParty>/,
      '',
    );
    const otherSupplier = xml
      .replace(IDENTITIES.SUP_A.taxId, IDENTITIES.BAD_VKN.taxId)
      .replace(uuid, uuid.replace('6001', '6002'));
    for (const pair of [
      [xml, otherSupplier],
      [withoutNumber, withoutNumber],
      [withoutSupplier, withoutSupplier],
      [withoutUuid, withoutUuid],
    ]) {
      const result = await parseMany(
        pair.map((data, index) => file(String(index), data)),
        { validate: false },
      );
      for (const item of result.items)
        if (item.kind === 'invoice') expect(item.issues.some((issue) => issue.code === 'EF091')).toBe(false);
    }
    const missingUuid = await parseMany([file('first', xml), file('missing', withoutUuid)], {
      validate: false,
    });
    expect(missingUuid.items[1]?.kind === 'invoice' && missingUuid.items[1].issues).toEqual([
      expectedIssue('EF091', '/Invoice/cbc:ID', { number: 'ORN2025000006001', firstUuid: uuid }),
    ]);
  });
  it('TC-M3-008 batch overrides apply after default issue ordering', async () => {
    const data = xml.replace(uuid, 'invalid-uuid');
    const result = await parseMany([file('a', data), file('b', data)], {
      rules: { EF002: 'info', EF090: 'error' },
    });
    const item = result.items[1];
    expect(item?.kind).toBe('invoice');
    if (item?.kind === 'invoice')
      expect(item.issues.map((issue) => [issue.code, issue.severity])).toEqual([
        ['EF002', 'info'],
        ['EF090', 'error'],
      ]);
  });
});
