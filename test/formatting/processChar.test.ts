import { processChar } from '../../src/formatting/processChar';

describe('processChar', () => {
  it('should add char to current if not delimiter', () => {
    const state = { quoteChar: '', depth: 0, current: '', parts: [] };
    processChar('a', 'a', 0, state, ',');
    expect(state.current).toBe('a');
  });

  it('should split on delimiter if depth is 0', () => {
    const state = { quoteChar: '', depth: 0, current: 'a', parts: [] };
    processChar(',', 'a,', 1, state, ',');
    expect(state.parts).toEqual(['a']);
    expect(state.current).toBe('');
  });

  it('should not split on delimiter if depth > 0', () => {
    const state = { quoteChar: '', depth: 1, current: '(', parts: [] as string[] };
    processChar(',', '(,', 1, state, ',');
    expect(state.current).toBe('(,');
    expect(state.parts).toEqual([]);
  });

  it('should detect start of line comment', () => {
    const state = { quoteChar: '', depth: 0, current: '', parts: [] as string[], isLineComment: false };
    processChar('/', '//', 0, state, ',');
    expect(state.isLineComment).toBe(true);
    expect(state.current).toBe('/');
  });

  it('should not split on delimiter inside line comment', () => {
    const state = { quoteChar: '', depth: 0, current: '// ', parts: [] as string[], isLineComment: true };
    processChar(',', '// ,', 3, state, ',');
    expect(state.current).toBe('// ,');
    expect(state.parts).toEqual([]);
  });

  it('should end line comment on newline', () => {
    const state = { quoteChar: '', depth: 0, current: '//', parts: [] as string[], isLineComment: true };
    processChar('\n', '//\n', 2, state, ',');
    expect(state.isLineComment).toBe(false);
    expect(state.current).toBe('//\n');
  });

  it('should treat escaped quotes as regular characters', () => {
    const state = { quoteChar: '', depth: 0, current: '', parts: [] as string[] };
    // Test input: `\`
    // We are processing the backtick at index 1.
    // The previous char at index 0 is backslash.
    const text = '\\`';
    processChar('`', text, 1, state, ',');
    expect(state.quoteChar).toBe('');
    expect(state.current).toBe('`');
  });
});
