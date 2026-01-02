import { handleColon } from './handleColon';
import { isEscaped } from './isEscaped';
import { DQL_ROOT_COMMANDS } from '../constants/dqlRootCommands.constant';
import { formatCommand } from './formatCommand';
import { splitByDelimiter } from './splitByDelimiter';

export const formatSegment = (seg: string): string => {
  let i = 0;
  // Stack stores the state of the current bracket level.
  // level 0 is the root string.
  const stack: { parts: string[]; currentPart: string; startChar: string }[] = [
    { parts: [], currentPart: '', startChar: '' },
  ];

  while (i < seg.length) {
    const char = seg[i];
    const current = stack[stack.length - 1];

    // Handle quotes
    if ('"\'`'.includes(char)) {
      const quoteChar = char;
      let quoteContent = char;
      i++;
      while (i < seg.length) {
        const c = seg[i];
        quoteContent += c;
        i++;
        if (c === quoteChar && !isEscaped(seg, i - 1)) {
          break;
        }
      }
      current.currentPart += quoteContent;
      continue;
    }

    // Handle template variables ${...}
    if (char === '$' && i + 1 < seg.length && seg[i + 1] === '{') {
      let braceDepth = 1;
      let content = '${';
      i += 2;

      while (i < seg.length) {
        const c = seg[i];

        if ('"\'`'.includes(c)) {
          const quoteChar = c;
          content += c;
          i++;
          while (i < seg.length) {
            const qc = seg[i];
            content += qc;
            i++;
            if (qc === quoteChar && !isEscaped(seg, i - 1)) {
              break;
            }
          }
          continue;
        }

        if (c === '{') {
          braceDepth++;
        }
        if (c === '}') {
          braceDepth--;
          if (braceDepth === 0) {
            content += c;
            i++;
            break;
          }
        }

        content += c;
        i++;
      }
      current.currentPart += content;
      continue;
    }

    // Handle opening brackets
    if ('[{'.includes(char)) {
      stack.push({ parts: [], currentPart: '', startChar: char });
      i++;
      continue;
    }

    // Handle closing brackets
    if (']}'.includes(char)) {
      const open = stack[stack.length - 1];
      const isMatching =
        stack.length > 1 && ((open.startChar === '[' && char === ']') || (open.startChar === '{' && char === '}'));

      if (isMatching) {
        stack.pop();
        // Finalize the last part
        if (open.currentPart.trim()) {
          open.parts.push(open.currentPart.trim());
        } else if (open.parts.length === 0 && open.currentPart.trim() === '') {
          // Empty block
        }

        const parts = open.parts;
        let formattedBlock = '';

        // Check if it's a subquery (starts with a root command or pipe)
        const firstPart = parts.length > 0 ? parts[0] : '';
        const trimmedFirst = firstPart.trim();
        const isSubquery =
          trimmedFirst.startsWith('|') ||
          DQL_ROOT_COMMANDS.some((cmd) => trimmedFirst.startsWith(cmd + ' ') || trimmedFirst === cmd);

        if (isSubquery) {
          // It's a subquery. We expect parts to contain the whole query as one string (because we didn't split by comma)
          const subquery = parts.join(', '); // Just in case

          // Format the subquery
          const commands = splitByDelimiter(subquery, '|');
          const formattedCommands = commands
            .map((cmd, index) => formatCommand(cmd, index))
            .filter((p) => p.length > 0)
            .join('\n');

          // Indent the formatted commands
          const INDENT = '  ';
          const indentedContent = formattedCommands.replace(/^/gm, INDENT);

          formattedBlock = `${open.startChar}\n${indentedContent}\n${char}`;
        } else if (parts.length > 1) {
          // Multiline
          const INDENT = '  ';
          const joined = parts.join(`,\n${INDENT}`);
          // Indent the closing bracket to align with start (0 indent relative to block)
          formattedBlock = `${open.startChar}\n${INDENT}${joined}\n${char}`;
        } else {
          // Single line
          const joined = parts.join(', ');
          formattedBlock = `${open.startChar} ${joined} ${char}`;
        }

        // Append to parent
        stack[stack.length - 1].currentPart += formattedBlock;
        i++;
      } else {
        // Unmatched or root level closing bracket
        current.currentPart += char;
        i++;
      }
      continue;
    }

    // Handle comma
    if (char === ',') {
      // If we are inside brackets (stack > 1), split.
      if (stack.length > 1) {
        // Check if we are in a subquery mode
        let isSubquery = false;
        const firstPart = current.parts.length > 0 ? current.parts[0] : current.currentPart;
        const trimmedFirst = firstPart.trim();

        if (
          trimmedFirst.startsWith('|') ||
          DQL_ROOT_COMMANDS.some((cmd) => trimmedFirst.startsWith(cmd + ' ') || trimmedFirst === cmd)
        ) {
          isSubquery = true;
        }

        if (isSubquery) {
          // Don't split, just append comma
          current.currentPart += ',';
          i++;
          if (i < seg.length && seg[i] !== '\n' && seg[i] !== ' ') {
            current.currentPart += ' ';
          }
          continue;
        }

        current.parts.push(current.currentPart.trim());
        current.currentPart = '';
        i++;
        continue;
      }
      // If at root level, apply Rule 3 (space after comma)
      current.currentPart += ',';
      i++;
      if (i < seg.length && seg[i] !== '\n' && seg[i] !== ' ') {
        current.currentPart += ' ';
      }
      continue;
    }

    // Handle colon
    if (char === ':') {
      const result = handleColon(seg, i);
      current.currentPart += result.newSeg;
      i = result.newIndex;
      continue;
    }

    // Default
    current.currentPart += char;
    i++;
  }

  return stack[0].currentPart;
};
