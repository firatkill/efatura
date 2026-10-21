/** Classify a virtual archive entry by its lowercase basename.
 * @example
 * classifyByName('month/INVOICE.XML'); // 'xml'
 */
export function classifyByName(path: string): 'xml' | 'zip' | 'sniff' | 'other' {
  const name = path.slice(path.lastIndexOf('/') + 1).toLowerCase();
  return name.endsWith('.xml')
    ? 'xml'
    : name.endsWith('.zip')
      ? 'zip'
      : name.includes('.')
        ? 'other'
        : 'sniff';
}
/** Ignore metadata entries without counting them towards archive limits.
 * @example
 * isJunk('month/__MACOSX/._invoice.xml'); // true
 */
export function isJunk(path: string): boolean {
  const parts = path.split('/'),
    name = parts.at(-1) ?? '';
  return (
    parts.includes('__MACOSX') ||
    ['.DS_Store', 'Thumbs.db', 'desktop.ini'].includes(name) ||
    name.startsWith('._')
  );
}
/** Detect a ZIP local-file header without trusting an extension.
 * @example
 * isZip(new Uint8Array([80,75,3,4])); // true
 */
export function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4;
}
