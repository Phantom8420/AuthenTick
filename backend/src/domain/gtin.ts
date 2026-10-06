/** GS1 check digit for the first 13 digits of a GTIN-14. */
export function gtinCheckDigit(first13: string): number {
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    // weights run 3,1,3,1... starting from the digit next to the check digit
    const weight = (12 - i) % 2 === 0 ? 3 : 1;
    sum += Number(first13[i]) * weight;
  }
  return (10 - (sum % 10)) % 10;
}

export function isValidGtin14(value: string): boolean {
  return /^\d{14}$/.test(value) && gtinCheckDigit(value.slice(0, 13)) === Number(value[13]);
}
