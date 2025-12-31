import { splitByDelimiter } from './split-by-delimiter';
import { applyFormattingToCode } from './apply-formatting-to-code';
import { DQL_ROOT_COMMANDS } from '../cli/constants/dqlRootCommands.constant';

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
    // New rule: first argument on same line, subsequent arguments indented to align with first argument
    const indentLength = prefix.length + commandName.length + 1;
    const indent = ' '.repeat(indentLength);

    const processedArgs = formattedArgs.map((arg) => arg.replace(/\n/g, '\n' + indent));
    return prefix + commandName + ' ' + processedArgs.join(',\n' + indent);
  } else {
    const joinedArgs = formattedArgs.join(', ');
    return prefix + commandName + (joinedArgs ? ' ' + joinedArgs : '');
  }
};
