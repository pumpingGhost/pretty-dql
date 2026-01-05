export interface StringLocation {
  value: string;
  start: number;
  end: number;
}

// Extract all string literals (single, double, and template) from given content
export function extractStringLocations(content: string): StringLocation[] {
  const results: StringLocation[] = [];
  let i = 0;
  const len = content.length;

  while (i < len) {
    const ch = content[i];

    // Handle normal string literals
    if (ch === '"' || ch === "'") {
      const start = i;
      const quote = ch;
      let value = quote;
      i++;
      let escaped = false;

      while (i < len) {
        const c = content[i];
        value += c;

        if (escaped) {
          escaped = false;
        } else if (c === '\\') {
          escaped = true;
        } else if (c === quote) {
          // end of string
          results.push({ value, start, end: i + 1 });
          i++;
          break;
        }

        i++;
      }
      continue;
    }

    // Handle template literals (basic support, including simple escapes and ${} blocks)
    if (ch === '`') {
      const start = i;
      let value = '`';
      i++;
      let escaped = false;

      while (i < len) {
        const c = content[i];
        value += c;

        if (escaped) {
          escaped = false;
          i++;
          continue;
        }

        if (c === '\\') {
          escaped = true;
          i++;
          continue;
        }

        if (c === '$' && i + 1 < len && content[i + 1] === '{') {
          // enter ${ ... } expression, track nested braces
          i += 2; // skip "${"
          value += '{';
          let depth = 1;
          let innerEscaped = false;

          while (i < len && depth > 0) {
            const ic = content[i];
            value += ic;

            if (innerEscaped) {
              innerEscaped = false;
            } else if (ic === '\\') {
              innerEscaped = true;
            } else if (ic === '{') {
              depth++;
            } else if (ic === '}') {
              depth--;
            }

            i++;
          }
          continue;
        }

        if (c === '`') {
          // end of template literal
          results.push({ value, start, end: i + 1 });
          i++;
          break;
        }

        i++;
      }
      continue;
    }

    i++;
  }

  return results;
}

export function extractStrings(content: string): string[] {
  return extractStringLocations(content).map((loc) => loc.value);
}
