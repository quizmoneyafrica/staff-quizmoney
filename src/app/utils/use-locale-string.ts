export function convertToLocaleString(value: number) {
  if (typeof value === 'number') {
    return value.toLocaleString('en-US');
  }
  return '';
}
