import { extractStrings } from './extractStrings.util';
import { isDqlContent } from './isDqlContent.util';

export function extractDqlCommands(content: string): string[] {
  const all = extractStrings(content);

  return all.filter(isDqlContent).map((raw) => {
    if (!raw || raw.length < 2) {
      return raw;
    }
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
    return s;
  });
}
