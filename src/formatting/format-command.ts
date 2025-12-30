import { splitByDelimiter } from './split-by-delimiter';
import { applyFormattingToCode } from './apply-formatting-to-code';

export const formatCommand = (cmdStr: string, index: number): string => {
  const p = cmdStr.trim();
  if (p.length === 0) return '';

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

  if (formattedArgs.length > 1) {
    // Indent the arguments if there are multiple
    const indent = index > 0 ? '  ' : '';
    const joinedArgs = formattedArgs.join(',\n' + indent);
    return prefix + commandName + '\n' + indent + joinedArgs;
  } else {
    const joinedArgs = formattedArgs.join(', ');
    return prefix + commandName + (joinedArgs ? ' ' + joinedArgs : '');
  }
};
