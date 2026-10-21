import {
  isDecimal,
  normalize,
  add,
  sub,
  mul,
  neg,
  abs,
  cmp,
  eq,
  sum,
  round,
  div,
  movePoint,
  within,
  scale,
} from './operations';

/** Exact decimal-string arithmetic; results preserve the specified scale.
 * @example
 * decimal.add('100.50', '0.5'); // '101.00'
 */
export const decimal = {
  isDecimal,
  normalize,
  add,
  sub,
  mul,
  neg,
  abs,
  cmp,
  eq,
  sum,
  round,
  div,
  movePoint,
  within,
  scale,
};
