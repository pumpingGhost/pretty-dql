import { splitByDelimiter } from './splitByDelimiter';
import { applyFormattingToCode } from './applyFormattingToCode';
import { DQL_ROOT_COMMANDS } from '../constants/dqlRootCommands.constant';

export const formatCommand = (cmdStr: string, index: number): string => {
  const hasTrailingBlankLine = /(\r?\n\s*){2,}$/.test(cmdStr);
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
    const res = prefix + applyFormattingToCode(p);
    return hasTrailingBlankLine ? res + '\n' : res;
  }

  // Split the arguments by comma
  const args = splitByDelimiter(argsStr, ',');
  const formattedArgs = args.map((arg) => applyFormattingToCode(arg).trim());

  const isRootCommand = DQL_ROOT_COMMANDS.includes(commandName);
  const hasBrackets = formattedArgs.some((arg) => /^\s*[\{\[]/.test(arg));

  let formattedCommand: string;

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
      // Trailing comments (starting with //) or blank lines at the end of the argument
      // should likely NOT be indented with the argument comma-list indentation, because
      // they are usually "next command" comments or spacing that belongs to the root level.
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
            break;
          }
        }

        if (pivotIndex < lines.length && pivotIndex > 0) {
          const mainPart = lines.slice(0, pivotIndex).join('\n');
          const trailingPart = lines.slice(pivotIndex).join('\n');

          const indentedMain = mainPart.replace(/\n/g, '\n' + myIndent);
          // Trailing part: preserve structure.
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

    formattedCommand = prefix + commandName + ' ' + processedArgs.join(',');
  } else {
    const joinedArgs = formattedArgs.join(', ');
    formattedCommand = prefix + commandName + (joinedArgs ? ' ' + joinedArgs : '');
  }

  return hasTrailingBlankLine ? formattedCommand + '\n' : formattedCommand;
};
