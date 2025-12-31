import { formatDql } from '../src';
// @ts-ignore
import { join, fetch, normalArguments, semanticArguments } from '../playground/demo';

describe('Demo Integration Tests', () => {
  test('join', () => {
    const formatted = formatDql(join);
    expect(formatted).toContain('| join');
    expect(formatted).toContain('[ fetch dt.entity.service, dt.service ],');
    expect(formatted).toContain('on: { left[ dt.entity.service ] == right[ id ] },');
    expect(formatted).toContain('fields: {');
    expect(formatted).toContain('  id,');
    expect(formatted).toContain('  dt.security.context,');
    expect(formatted).toContain('kind: inner');
  });

  test('fetch', () => {
    const formatted = formatDql(fetch);
    expect(formatted).toContain('fetch spans, samplingRatio: $(samplingRatio), scanLimitGBytes: 50');
    expect(formatted).toContain('| fields a,');
    expect(formatted).toContain('         b');
    expect(formatted).toContain('| fieldsAdd x');
    expect(formatted).toContain('| fields [ entity ],');
    expect(formatted).toContain('         { queryCount } = toLong(queryCount),');
    expect(formatted).toContain('         errorCount = toLong(errorCount)');
    expect(formatted).toContain('| summarize count(),');
    expect(formatted).toContain('    by: { entity }');
  });

  test('normalArguments', () => {
    const formatted = formatDql(normalArguments);
    expect(formatted).toContain('| fields a,');
    expect(formatted).toContain('         b,');
    expect(formatted).toContain('         c');
  });

  test('semanticArguments', () => {
    const formatted = formatDql(semanticArguments);
    expect(formatted).toContain('| fields a,');
    expect(formatted).toContain('    by: b,');
    expect(formatted).toContain('    kind: inner');
  });
});
