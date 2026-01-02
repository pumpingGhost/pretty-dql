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

  if (formattedArgs.length > 1 && (index > 0 || !isRootCommand)) {
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

      // Indent internal newlines
      const indentedArg = arg.replace(/\n/g, '\n' + myIndent);

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
