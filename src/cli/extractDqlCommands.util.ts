import { extractStringLocations, StringLocation } from './extractStrings.util';
import { isDqlContent } from './isDqlContent.util';

export interface DqlCommandLocation extends StringLocation {
  dql: string;
}

export function extractDqlCommandLocations(content: string): DqlCommandLocation[] {
  const all = extractStringLocations(content);

  return all
    .filter((loc) => isDqlContent(loc.value))
    .map((loc) => {
      const raw = loc.value;
      if (!raw || raw.length < 2) {
        return { ...loc, dql: raw };
      }
      const first = raw[0];
      const last = raw[raw.length - 1];
      let s = raw;

      if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
        s = raw.substring(1, raw.length - 1);
      }
      return { ...loc, dql: s };
    });
}

export function extractDqlCommands(content: string): string[] {
  return extractDqlCommandLocations(content).map((loc) => loc.dql);
}
