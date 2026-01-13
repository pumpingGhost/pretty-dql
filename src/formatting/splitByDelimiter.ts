import { processChar } from './processChar';

export const splitByDelimiter = (str: string, delimiter: string, shouldTrim = true): string[] => {
  // Initialize the state for splitting the string by a delimiter
  const state = {
    quoteChar: '',
    depth: 0,
    current: '',
    parts: [] as string[],
    isLineComment: false,
    shouldTrim,
  };

  for (let i = 0; i < str.length; i++) {
    processChar(str[i], str, i, state, delimiter);
  }
  if (state.current.trim()) {
    state.parts.push(shouldTrim ? state.current.trim() : state.current);
  }
  return state.parts;
};
