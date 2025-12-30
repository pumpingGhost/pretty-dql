import { extractDqlCommands } from '../../src/cli/utils/extractDqlCommands.util';

describe('extractDqlCommands', () => {
  test('extracts only DQL strings and strips surrounding quotes', () => {
    const input = [
      'const q1 = "data from logs";',
      "const q2 = '| filter status == 200';",
      "const notDql = 'hello world';",
    ].join('\n');

    expect(extractDqlCommands(input)).toEqual(['data from logs', '| filter status == 200']);
  });

  test('handles backtick template literals with DQL content', () => {
    const input = 'const q = `timeseries cpu.usage`';
    expect(extractDqlCommands(input)).toEqual(['timeseries cpu.usage']);
  });

  test('ignores strings that look similar but are not valid DQL', () => {
    const input = ["const a = 'unknown command';", "const b = '| notACommand something';"].join('\n');

    expect(extractDqlCommands(input)).toEqual([]);
  });

  test('supports multiple commands in a single file', () => {
    const input = [
      'const a = "data from logs";',
      'const b = "| filter status == 500";',
      'const c = "| summarize count()";',
    ].join('\n');

    expect(extractDqlCommands(input)).toEqual(['data from logs', '| filter status == 500', '| summarize count()']);
  });

  test('supports multiple commands with space prefix', () => {
    const input = [
      'const a = " data from logs";',
      'const b = " | filter status == 500";',
      'const c = " | summarize count()";',
    ].join('\n');

    expect(extractDqlCommands(input)).toEqual([' data from logs', ' | filter status == 500', ' | summarize count()']);
  });
});
