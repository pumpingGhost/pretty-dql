import { isEscaped } from './isEscaped';

export const processChar = (
  char: string,
  str: string,
  index: number,
  state: {
    quoteChar: string;
    depth: number;
    current: string;
    parts: string[];
    isLineComment?: boolean;
    shouldTrim?: boolean;
  },
  delimiter: string,
) => {
  // Handle line comments
  if (state.isLineComment) {
    state.current += char;
    if (char === '\n') {
      state.isLineComment = false;
    }
    return;
  }

  // Handle characters inside quotes to avoid splitting on delimiters within strings
  if (state.quoteChar) {
    state.current += char;
    if (char === state.quoteChar && !isEscaped(str, index)) {
      state.quoteChar = '';
    }
    return;
  }

  // Detect start of line comment
  if (char === '/' && str[index + 1] === '/') {
    state.isLineComment = true;
    state.current += char;
    return;
  }

  if (char === '"' || char === "'" || char === '`') {
    state.quoteChar = char;
    state.current += char;
    return;
  }

  // Track the depth of nested structures like brackets to avoid splitting inside them
  if ('([{'.includes(char)) {
    state.depth++;
    state.current += char;
    return;
  }

  if (')]}'.includes(char)) {
    state.depth--;
    state.current += char;
    return;
  }

  // Split by the delimiter only if we are at the top level (depth 0)
  if (char === delimiter && state.depth === 0) {
    state.parts.push(state.shouldTrim ? state.current.trim() : state.current);
    state.current = '';
    return;
  }

  state.current += char;
};
