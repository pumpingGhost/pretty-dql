import { splitByDelimiter } from './split-by-delimiter';
import { formatCommand } from './format-command';

/**
 * Formats a DQL query string and fixes basic syntax errors.
 *
 * @param dql - The DQL query string to format.
 * @returns The formatted DQL query string.
 */
export const formatDql = (dql: string): string => {
    // Split the DQL query by the pipe character to separate commands
    const commands = splitByDelimiter(dql, '|');
    return commands
        .map((cmd, index) => formatCommand(cmd, index))
        .filter((p) => p.length > 0)
        .join('\n');
};
