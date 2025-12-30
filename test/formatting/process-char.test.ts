import { processChar } from '../../src/formatting/process-char';

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
    const state = { quoteChar: '', depth: 1, current: '(', parts: [] };
    processChar(',', '(,', 1, state, ',');
    expect(state.current).toBe('(,');
    expect(state.parts).toEqual([]);
  });
});
