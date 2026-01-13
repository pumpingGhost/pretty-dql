import { formatSegment } from '../../src/formatting/formatSegment';

describe('formatSegment', () => {
  it('should format brackets', () => {
    // Current logic: single item -> no space
    expect(formatSegment('[a]')).toBe('[a]');
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

  it('should not split by comma inside parentheses', () => {
    const input = 'func(a,b)';
    expect(formatSegment(input)).toBe('func(a, b)');
  });

  it('should not format line comments', () => {
    expect(formatSegment('// a:b')).toBe('// a:b');
  });

  it('should not format line comments ending with newline', () => {
    // Note: formatSegment logic appends preserved comment to currentPart.
    // The whitespace preservation depends on implementation.
    // If input has newline, output should preserve it.
    expect(formatSegment('// a:b\n')).toBe('// a:b\n');
  });

  it('should not format mixed content and comments', () => {
    // 'a:b // c:d' -> 'a: b // c:d'
    // 'a:b' formats to 'a: b'.
    // '// c:d' preserves.
    // Space before //?
    // formatSegment processes 'a' ':' 'b' ' ' '/' '/'...
    // ' ' is preserved.
    expect(formatSegment('a:b // c:d')).toBe('a: b // c:d');
  });

  it('should not split by comma inside nested parentheses', () => {
    const input = 'func(a, func2(b, c))';
    expect(formatSegment(input)).toBe('func(a, func2(b, c))');
  });

  it('should indent multiline content inside brackets even if only one part', () => {
    const input = `{ sum(a,\nb) }`;
    const expected = `{\n  sum(a,\n  b)\n}`;
    expect(formatSegment(input)).toBe(expected);
  });

  it('should format brackets with spaces only if multiple arguments', () => {
    // Single argument - no spaces
    expect(formatSegment('fieldsAdd (a)')).toBe(`fieldsAdd (a)`);
    // Multiple arguments - spaces inside (actually fieldsAdd uses parens usually without brackets, but let's test generic brackets)
    // But formatSegment logic for brackets applies to [ and {
    expect(formatSegment('summarize { count() }')).toBe(`summarize { count() }`);

    expect(formatSegment('summarize { count(), avg() }')).toBe(`summarize {\n  count(),\n  avg()\n}`);
    expect(formatSegment('summarize {count()}')).toBe(`summarize { count() }`);
  });

  it('should space around equals', () => {
    expect(formatSegment('a=b')).toBe('a = b');
    expect(formatSegment('a  =b')).toBe('a = b');
    expect(formatSegment('a=  b')).toBe('a = b');
    expect(formatSegment('a==b')).toBe('a == b');
    // Test checking if it breaks logical operators (it only handles =)
    expect(formatSegment('a!=b')).toBe('a != b');
    expect(formatSegment('a<=b')).toBe('a <= b');
  });

  it('should merge multiple newlines into max one empty line', () => {
    expect(formatSegment('a\n\n\nb')).toBe('a\n\nb');
    expect(formatSegment('a\n\n\n\n\nb')).toBe('a\n\nb');
  });

  it('should preserve indentation after merged newlines', () => {
    expect(formatSegment('a\n\n\n  b')).toBe('a\n\n  b');
  });

  it('should format single-line curly brackets with spaces', () => {
    expect(formatSegment('{a}')).toBe('{ a }');
  });

  it('should format single-line square brackets without spaces for single item', () => {
    expect(formatSegment('[a]')).toBe('[a]');
  });

  it('should format empty brackets correctly', () => {
    expect(formatSegment('[]')).toBe('[]');
    expect(formatSegment('{}')).toBe('{  }');
  });
});
