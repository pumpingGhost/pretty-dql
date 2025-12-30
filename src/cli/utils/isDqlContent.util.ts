import { DQL_ROOT_COMMANDS } from '../constants/dqlRootCommands.constant';
import { DQL_TRANSFORMATION_COMMANDS } from '../constants/dqlTransformationCommands.constant';

export function isDqlContent(raw: string): boolean {
  // Remove surrounding quotes/backticks if present and trim whitespace
  const first = raw[0];
  const last = raw[raw.length - 1];
  let s = raw;
  if (
    (first === '"' && last === '"') ||
    (first === "'" && last === "'") ||
    (first === '`' && last === '`')
  ) {
    s = raw.substring(1, raw.length - 1);
  }

  s = s.trimStart();

  if (s.length === 0) {
    return false;
  }

  const hasLeadingPipe = s[0] === '|';

  if (hasLeadingPipe) {
    // We expect only pipe-only commands here
    s = s.slice(1).trimStart();
    if (s.length === 0) {
      return false;
    }

    const match = /^[A-Za-z]+/.exec(s);
    if (!match) {
      return false;
    }

    const cmd = match[0];
    return DQL_TRANSFORMATION_COMMANDS.includes(cmd);
  }

  // No leading pipe: must be one of the root commands
  const match = /^[A-Za-z]+/.exec(s);
  if (!match) {
    return false;
  }

  const cmd = match[0];
  return DQL_ROOT_COMMANDS.includes(cmd);
}
