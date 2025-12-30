import { isDqlContent } from '../../src/cli/utils/isDqlContent.util';

describe('isDqlContent', () => {
  test('returns true for root commands without quotes', () => {
    expect(isDqlContent('data from logs')).toBe(true);
    expect(isDqlContent('timeseries foo')).toBe(true);
  });

  test('returns true for root commands with surrounding quotes or backticks', () => {
    expect(isDqlContent('"data from logs"')).toBe(true);
    expect(isDqlContent("'timeseries foo'")).toBe(true);
    expect(isDqlContent('`metrics foo`')).toBe(true);
  });

  test('returns true for transformation commands with leading pipe', () => {
    expect(isDqlContent('| filter status == 200')).toBe(true);
    expect(isDqlContent('  | summarize count()')).toBe(true);
  });

  test('returns false for unknown commands and invalid starts', () => {
    expect(isDqlContent('unknownCommand something')).toBe(false);
    expect(isDqlContent('| unknownCommand something')).toBe(false);
    expect(isDqlContent('| 123')).toBe(false);
    expect(isDqlContent('')).toBe(false);
    expect(isDqlContent('   ')).toBe(false);
  });
});
