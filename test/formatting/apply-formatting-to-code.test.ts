import { applyFormattingToCode } from '../../src/formatting/apply-formatting-to-code';

describe('applyFormattingToCode', () => {
    it('should format code segments', () => {
        expect(applyFormattingToCode('a:b "c:d"')).toBe('a: b "c:d"');
    });
});

