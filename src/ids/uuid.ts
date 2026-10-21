/** Check UUID shape without restricting version or variant nibbles.
 * @example
 * isValidUuid('00000000-0000-0000-0000-000000000001'); // true
 */
export function isValidUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}
