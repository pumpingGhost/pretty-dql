import { isEscaped } from '../../src/formatting/isEscaped';

describe('isEscaped', () => {
  it('should return false if character is not escaped', () => {
    expect(isEscaped('abc', 1)).toBe(false);
  });

  it('should return true if character is escaped', () => {
    expect(isEscaped('a\\bc', 2)).toBe(true);
  });

  it('should return false if character is preceded by double backslash', () => {
    expect(isEscaped('a\\\\bc', 3)).toBe(false);
  });
});
