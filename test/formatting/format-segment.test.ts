import { formatSegment } from '../../src/formatting/format-segment';

describe('formatSegment', () => {
    it('should format brackets', () => {
        expect(formatSegment('[a]')).toBe('[ a ]');
    });

    it('should format colons', () => {
        expect(formatSegment('a:b')).toBe('a: b');
    });

    it('should not format quoted strings', () => {
        expect(formatSegment('"a:b"')).toBe('"a:b"');
    });
});

