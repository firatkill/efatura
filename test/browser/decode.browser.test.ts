import { expect, it } from 'vitest';
import { decodeInput } from '../../src/xml/decode';
import { turkishBytes } from '../helpers/xml';

it.each(['windows-1254', 'iso-8859-9'])(
  'TC-M1-008 / A-24 / BT-04: decodes Turkish text using %s',
  (label) => {
    const text = `<?xml encoding="${label}"?><Invoice>ğş</Invoice>`;
    expect(decodeInput(turkishBytes(text))).toEqual({ text, encoding: label, issues: [] });
  },
);
