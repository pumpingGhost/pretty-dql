import { splitByDelimiter } from './splitByDelimiter';
import { applyFormattingToCode } from './applyFormattingToCode';
import { DQL_ROOT_COMMANDS } from '../constants/dqlRootCommands.constant';

export const formatCommand = (cmdStr: string, index: number): string => {
  const p = cmdStr.trim();
  if (p.length === 0) {
    return '';
  }

  const firstSpaceIndex = p.search(/\s/);
  const commandName = firstSpaceIndex === -1 ? p : p.slice(0, firstSpaceIndex);
  const argsStr = firstSpaceIndex === -1 ? '' : p.slice(firstSpaceIndex + 1);

  const prefix = index > 0 ? '| ' : '';

  // Check if the command name is valid (alphanumeric), otherwise we just format the whole string
  if (!/^\w+$/.test(commandName)) {
    return prefix + applyFormattingToCode(p);
  }

  // Split the arguments by comma
  const args = splitByDelimiter(argsStr, ',');
  const formattedArgs = args.map((arg) => applyFormattingToCode(arg).trim());

  const isRootCommand = DQL_ROOT_COMMANDS.includes(commandName);
  const hasBrackets = formattedArgs.some((arg) => /^\s*[\{\[]/.test(arg));

  if (formattedArgs.length > 1 && (index > 0 || !isRootCommand || hasBrackets)) {
    // Indent the arguments if there are multiple and it's not the first command
    // Normal arguments: aligned with the first argument
    const normalIndentLength = prefix.length + commandName.length + 1;
    const normalIndent = ' '.repeat(normalIndentLength);

    // Semantic arguments (key: value): indented by 2 spaces from the command start
    const semanticIndentLength = prefix.length + 2;
    const semanticIndent = ' '.repeat(semanticIndentLength);

    const processedArgs = formattedArgs.map((arg, i) => {
      // Check if argument is "semantic" (starts with key:) or starts with a bracket
      const isSemantic = /^\s*[\w.]+\s*:/.test(arg);
      const isBracket = /^\s*[\[\{]/.test(arg);
      const myIndent = isSemantic || isBracket ? semanticIndent : normalIndent;

      let indentedArg: string;

      // Special handling for the last argument to prevent indenting trailing comments
      if (i === formattedArgs.length - 1) {
        const lines = arg.split('\n');
        let pivotIndex = lines.length;

        // Iterate from bottom up to find where "trailing" part starts
        // Trailing part: lines that are blank or start with //
        for (let j = lines.length - 1; j >= 0; j--) {
          const line = lines[j].trim();
          if (line.length === 0 || line.startsWith('//')) {
            pivotIndex = j;
          } else {
            // Found non-comment, non-empty code lines. Stop.
            break;
          }
        }

        if (pivotIndex < lines.length && pivotIndex > 0) {
          // We found a trailing block
          const mainPart = lines.slice(0, pivotIndex).join('\n');
          const trailingPart = lines.slice(pivotIndex).join('\n');

          const indentedMain = mainPart.replace(/\n/g, '\n' + myIndent);
          // Trailing part: preserve structure but don't add myIndent.
          // We simply join it back with newline, effectively resetting indentation to start of line.
          indentedArg = indentedMain + '\n' + trailingPart;
        } else {
          // No special trailing block or entire arg is trailing junk
          indentedArg = arg.replace(/\n/g, '\n' + myIndent);
        }
      } else {
        // Normal processing for non-last arguments
        indentedArg = arg.replace(/\n/g, '\n' + myIndent);
      }

      if (i === 0) {
        return indentedArg;
      }
      return '\n' + myIndent + indentedArg;
    });

    return prefix + commandName + ' ' + processedArgs.join(',');
  } else {
    const joinedArgs = formattedArgs.join(', ');
    return prefix + commandName + (joinedArgs ? ' ' + joinedArgs : '');
  }
};
