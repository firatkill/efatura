import type { BatchErrorCode, BatchItem, SourceRef, ZipErrorCode } from '../types';
const messages = {
  READ_FAILED: ['The file could not be read: {reason}', 'Dosya okunamadı: {reason}'],
  ZIP_INPUT_REQUIRES_ZIP_ENTRY: [
    'This is a ZIP archive; use parseZip or parseAny from @firatkill/efatura/zip.',
    'Bu bir ZIP arşivi; @firatkill/efatura/zip içindeki parseZip veya parseAny kullanılmalı.',
  ],
  ZIP_INVALID: [
    'The ZIP archive is damaged or not a ZIP archive.',
    'ZIP arşivi bozuk veya ZIP arşivi değil.',
  ],
  ZIP_ENCRYPTED: ['Encrypted ZIP entries are not supported.', 'Şifreli ZIP girdileri desteklenmiyor.'],
  ZIP_UNSUPPORTED_METHOD: [
    'ZIP compression method {method} is not supported.',
    '{method} ZIP sıkıştırma yöntemi desteklenmiyor.',
  ],
  ZIP_DEPTH_EXCEEDED: [
    'Archives are nested more than {max} levels deep.',
    'Arşivler {max} seviyeden fazla iç içe.',
  ],
  ZIP_TOO_MANY_ENTRIES: [
    'The archive has more than {max} entries; reading stopped.',
    'Arşivde {max} girdiden fazlası var; okuma durduruldu.',
  ],
  ZIP_TOO_LARGE: [
    'The archive unpacks to more than {max} bytes; reading stopped.',
    'Arşiv açıldığında {max} baytı aşıyor; okuma durduruldu.',
  ],
  ZIP_ENTRY_TOO_LARGE: [
    'The entry unpacks to more than {max} bytes.',
    'Girdi açıldığında {max} baytı aşıyor.',
  ],
  ZIP_RATIO_EXCEEDED: [
    'The entry is compressed more than {max} to 1, which suggests a zip bomb.',
    "Girdi {max}'e 1'den fazla sıkıştırılmış; bu bir zip bombasına işaret ediyor.",
  ],
} as const;
/** Create a bilingual archive or file error from the normative catalogue.
 * @example
 * zipError('ZIP_DEPTH_EXCEEDED', source, {max: 3});
 */
export function zipError(
  code: ZipErrorCode | BatchErrorCode,
  source: SourceRef,
  details?: Record<string, string | number>,
): Extract<BatchItem, { kind: 'error' }> {
  const render = (message: string) =>
    message.replace(/\{(\w+)\}/g, (_match: string, key: string) => String(details?.[key]));
  return {
    kind: 'error',
    source,
    error: {
      code,
      message: render(messages[code][0]),
      messageTr: render(messages[code][1]),
      ...(details === undefined ? {} : { details }),
    },
  };
}
