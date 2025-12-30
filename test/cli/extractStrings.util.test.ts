import { extractStrings } from '../../src/cli/utils/extractStrings.util';

describe('extractStrings', () => {
  test('extracts single and double quoted strings', () => {
    const input = 'const a = \'hello\'; const b = "world";';
    expect(extractStrings(input)).toEqual(["'hello'", '"world"']);
  });

  test('handles escaped quotes and backslashes', () => {
    const input = 'const a = "he\\"llo"; const b = \'ba\\\\r\';';
    expect(extractStrings(input)).toEqual(['"he\\"llo"', "'ba\\\\r'"]);
  });

  test('extracts simple template literals without expressions', () => {
    const input = 'const t = ` hello world`;';
    expect(extractStrings(input)).toEqual(['` hello world`']);
  });

  test('extracts template literals with ${} expressions and nested braces', () => {
    const input = 'const t = `value is ${foo({ bar: 1 })} end`;';
    expect(extractStrings(input)).toEqual(['`value is ${foo({ bar: 1 })} end`']);
  });

  test('ignores unterminated strings', () => {
    const input = 'const a = \'hello; const b = "world";';
    // The current implementation drops unterminated strings entirely.
    expect(extractStrings(input)).toEqual([]);
  });

  test('handles backticks and escaped sequences in templates', () => {
    const input = 'const t = `a\\`b\\${c}`;';
    expect(extractStrings(input)).toEqual(['`a\\`b\\${c}`']);
  });
});
