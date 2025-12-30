import { formatDql } from '../../src/formatting/format-dql';

describe('formatDql', () => {
  it('should format a simple DQL query', () => {
    const input = '| fields entity, queryCount = toLong(queryCount), errorCount = toLong(errorCount)';
    const expected = `| fields
  entity,
  queryCount = toLong(queryCount),
  errorCount = toLong(errorCount)`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should format a DQL query with multiple commands', () => {
    const input = '| fields entity | filter queryCount > 10';
    const expected = `| fields entity
| filter queryCount > 10`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should handle brackets correctly', () => {
    const input = '| fields [entity], {queryCount}';
    const expected = `| fields
  [ entity ],
  { queryCount }`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should handle colons correctly', () => {
    const input = '| summarize count(), by:{entity}';
    const expected = `| summarize
  count(),
  by: { entity }`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should not format inside quotes', () => {
    const input = '| filter message == "some: message [with] brackets"';
    const expected = `| filter message == "some: message [with] brackets"`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should handle escaped quotes', () => {
    const input = '| filter message == "some \\"quoted\\" message"';
    const expected = `| filter message == "some \\"quoted\\" message"`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should handle nested brackets', () => {
    const input = '| fields [nested [brackets]]';
    const expected = `| fields [ nested [ brackets ] ]`;
    expect(formatDql(input)).toBe(expected);
  });

  it('should handle URLs correctly', () => {
    const input = '| filter url == "http://example.com"';
    const expected = `| filter url == "http://example.com"`;
    expect(formatDql(input)).toBe(expected);
  });
});
