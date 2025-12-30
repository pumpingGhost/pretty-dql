import { isEscaped } from './is-escaped';

export const tokenizeByQuotes = (text: string): string[] => {
  // We want to split the text into segments, keeping quoted strings intact
  const segments: string[] = [];
  let current = '';
  let quoteChar = '';
  let inTemplateVar = false;
  let braceDepth = 0;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inTemplateVar) {
      current += char;
      if (quoteChar) {
        if (char === quoteChar && !isEscaped(text, i)) {
          quoteChar = '';
        }
      } else {
        if (char === '"' || char === "'" || char === '`') {
          quoteChar = char;
        } else if (char === '{') {
          braceDepth++;
        } else if (char === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            inTemplateVar = false;
            segments.push(current);
            current = '';
          }
        }
      }
      continue;
    }

    if (quoteChar) {
      current += char;
      // Check if the current quote is closed and not escaped
      if (char === quoteChar && !isEscaped(text, i)) {
        quoteChar = '';
        segments.push(current);
        current = '';
      }
      continue;
    }

    if (char === '$' && text[i + 1] === '{') {
      if (current) {
        segments.push(current);
        current = '';
      }
      inTemplateVar = true;
      current += char;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      // We found a start of a quoted string, so we push the previous segment
      if (current) {
        segments.push(current);
      }
      quoteChar = char;
      current = char;
      continue;
    }

    current += char;
  }
  if (current) {
    segments.push(current);
  }
  return segments;
};
