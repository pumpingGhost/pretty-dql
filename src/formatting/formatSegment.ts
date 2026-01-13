import { handleColon } from './handleColon';
import { isEscaped } from './isEscaped';
import { DQL_ROOT_COMMANDS } from '../constants/dqlRootCommands.constant';
import { formatCommand } from './formatCommand';
import { splitByDelimiter } from './splitByDelimiter';
import { handleEquals } from './handleEquals';

export const formatSegment = (seg: string): string => {
  let i = 0;
  // Stack stores the state of the current bracket level.
  // level 0 is the root string.
  const stack: { parts: string[]; currentPart: string; startChar: string; parenDepth: number }[] = [
    { parts: [], currentPart: '', startChar: '', parenDepth: 0 },
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

    // Handle line comments
    if (char === '/' && i + 1 < seg.length && seg[i + 1] === '/') {
      let commentContent = char;
      i++;
      while (i < seg.length) {
        const c = seg[i];
        commentContent += c;
        if (c === '\n' || c === '\r') {
          i++;
          break;
        }
        i++;
      }
      current.currentPart += commentContent;
      // If we hit newline, loop will continue, incrementing i if not careful
      // The while loop consumes the newline? Yes: commentContent += c; i++.
      // But outer loop also has logic?
      // Wait, outer loop is while (i < seg.length).
      // Here we incremented i. So next iteration resumes after newline.
      // But if we consumed newline, we are good.
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

    // Handle parentheses for depth tracking (to avoid splitting by comma inside them)
    if (char === '(') {
      current.parenDepth++;
      current.currentPart += char;
      i++;
      continue;
    }
    if (char === ')') {
      if (current.parenDepth > 0) {
        current.parenDepth--;
      }
      current.currentPart += char;
      i++;
      continue;
    }

    // Handle opening brackets
    if ('[{'.includes(char)) {
      stack.push({ parts: [], currentPart: '', startChar: char, parenDepth: 0 });
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
          // We must handle indentation for single line bracket if it internally contains newlines (e.g. from parentheses with newlines)
          if (joined.includes('\n')) {
            const INDENT = '  ';
            // We need to indent every newline inside 'joined'.
            // But we need to be careful if we are adding excessive indentation.
            // Here we force multiline block style.

            // Ensure wrapped content is indented.
            // If joined content has internal newlines, they might have their own indent.
            // We replace newline+whitespace with newline+INDENT.
            const indentedJoined = joined.replace(/\n\s*/g, `\n${INDENT}`);
            formattedBlock = `${open.startChar}\n${INDENT}${indentedJoined}\n${char}`;
          } else {
            formattedBlock = `${open.startChar} ${joined} ${char}`;
          }
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

        // Only split if parenDepth is 0
        if (current.parenDepth === 0) {
          current.parts.push(current.currentPart.trim());
          current.currentPart = '';
          i++;
          continue;
        } else {
          current.currentPart += ',';
          i++;
          if (i < seg.length && seg[i] !== '\n' && seg[i] !== ' ') {
            current.currentPart += ' ';
          }
          continue;
        }
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

    // Handle equals
    if (char === '=') {
      const result = handleEquals(seg, i);

      // If handleEquals returns string starting with space (result.newSeg[0] === ' '),
      // we must ensure that currentPart does not already end with space.
      // If it does, we should trim existing spaces.

      const isStartSpace = result.newSeg.startsWith(' ');

      if (isStartSpace) {
        current.currentPart = current.currentPart.replace(/\s+$/, '');
      } else {
        // It does not start with space. This usually means it is a composite operator part (e.g. <=).
        // In this case, we might need to ensure space BEFORE the previous character, if it wasn't there.
        // e.g. input `a<=b`. `currentPart` is `...a<`. We append `= `. result `...a<= `.
        // We want `...a <= `.

        // So we need to check if we should add space before the last character of currentPart.
        // Wait, checking last char is tricky.
        // We assume the operator is 2 chars. `currentPart` ends with operator[0].
        // We want space before operator[0].

        // If we blindly add space?
        // `current.currentPart` -> remove last char, trim spaces, add space, add last char.

        // But we need to know IF we should do this.
        // `handleEquals` knows if it matched composite (via `isPartOfComposite`).
        // However, `handleEquals` doesn't return that flag explicitly.
        // But we can infer it: if `newSeg` does NOT start with space, it's composite part.

        // EXCEPT if it was somehow start of string? But `seg[i-1]` check handles that.

        // So if !isStartSpace, we probably want space before the composite operator.
        // The composite operator started at `seg[i-1]`.
        // `currentPart` ends with `seg[i-1]`.

        // Let's implement logic to insert space before the last character.
        if (current.currentPart.length > 0) {
          const lastChar = current.currentPart[current.currentPart.length - 1]; // e.g. '<'
          const prefix = current.currentPart.slice(0, -1);
          // Ensure space before lastChar
          current.currentPart = prefix.replace(/\s+$/, '') + ' ' + lastChar;
        }
      }

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
