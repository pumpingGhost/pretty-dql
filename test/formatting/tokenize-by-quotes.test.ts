import { tokenizeByQuotes } from '../../src/formatting/tokenize-by-quotes';

describe('tokenizeByQuotes', () => {
  it('should tokenize string without quotes', () => {
    expect(tokenizeByQuotes('abc')).toEqual(['abc']);
  });

  it('should tokenize string with quotes', () => {
    expect(tokenizeByQuotes('a "b" c')).toEqual(['a ', '"b"', ' c']);
  });

  it('should handle escaped quotes', () => {
    expect(tokenizeByQuotes('a "b\\"c" d')).toEqual(['a ', '"b\\"c"', ' d']);
  });
});
