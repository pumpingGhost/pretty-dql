import { applyFormattingToCode } from '../../src/formatting/applyFormattingToCode';

describe('applyFormattingToCode', () => {
  it('should format code segments', () => {
    expect(applyFormattingToCode('a:b "c:d"')).toBe('a: b "c:d"');
  });
});
