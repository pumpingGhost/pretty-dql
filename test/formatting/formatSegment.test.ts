import { formatSegment } from '../../src/formatting/formatSegment';

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

  it('should align closing curly brackets on new line if multiline', () => {
    const input = 'fields: {\n  id,\n  name\n}';
    // Expect closing bracket to be on a new line
    expect(formatSegment(input)).toBe('fields: {\n  id,\n  name\n}');
  });

  it('should add space after comma if not followed by newline or space', () => {
    expect(formatSegment('func(a,b)')).toBe('func(a, b)');
    expect(formatSegment('func(a, b)')).toBe('func(a, b)');
    expect(formatSegment('func(a,\nb)')).toBe('func(a,\nb)');
  });

  it('should format multiline arguments inside brackets', () => {
    const input = 'fields: { id, name }';
    // Expect multiline formatting
    expect(formatSegment(input)).toBe('fields: {\n  id,\n  name\n}');
  });

  it('should format subqueries inside brackets with indentation', () => {
    const input = 'join [ fetch a, b ]';
    // Expect multiline formatting with indentation
    expect(formatSegment(input)).toBe('join [\n  fetch a, b\n]');
  });

  it('should handle template variables without formatting', () => {
    const input = 'filter ${ID} == "123"';
    expect(formatSegment(input)).toBe('filter ${ID} == "123"');
  });
});
