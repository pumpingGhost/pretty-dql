import { processChar } from './process-char';

export const splitByDelimiter = (str: string, delimiter: string): string[] => {
  // Initialize the state for splitting the string by a delimiter
  const state = { quoteChar: '', depth: 0, current: '', parts: [] as string[] };

  for (let i = 0; i < str.length; i++) {
    processChar(str[i], str, i, state, delimiter);
  }
  if (state.current.trim()) {
    state.parts.push(state.current.trim());
  }
  return state.parts;
};
