import { formatDql } from '../src';
// @ts-ignore
import {
  join,
  fetch,
  normalArguments,
  semanticArguments,
  nestedJoin,
  timeseries,
  newlines,
} from './integrationQueries';

describe('Demo Integration Tests', () => {
  test('join', () => {
    const formatted = formatDql(join);
    expect(formatted).toContain('| join');
    // Subquery is now multiline
    expect(formatted).toContain('fetch spans');
    expect(formatted).toContain('fieldsAdd dt.entity.service');
    expect(formatted).toContain('on: { left[dt.entity.service] == right[id] },');
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
    expect(formatted).toContain('| fields entity = [entity],');
    expect(formatted).toContain('         queryCount = toLong(queryCount),');
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

  test('nestedJoin', () => {
    const formatted = formatDql(nestedJoin);
    // Outer join
    expect(formatted).toContain('| join [');

    // First level subquery (indent 2 spaces)
    expect(formatted).toContain('  fetch spans');
    expect(formatted).toContain('  | fieldsAdd dt.entity.service');

    // Nested join (indent 2 spaces)
    expect(formatted).toContain('  | join [');

    // Second level subquery (indent 4 spaces)
    expect(formatted).toContain('    fetch spans');
    expect(formatted).toContain('    | fieldsAdd subField,');

    // Closing nested bracket (indent 2 spaces)
    expect(formatted).toContain('  ],');

    expect(formatted).toContain(']');
  });

  test('timeseries', () => {
    const formatted = formatDql(timeseries);
    expect(formatted).toContain('timeseries {');
    expect(formatted).toContain(
      '  receive.rate_per_minute = sum(dt.service.messaging.receive.count, scalar: true, rate: 1m, default: 0),',
    );
    expect(formatted).toContain(
      '  publish.rate_per_minute = sum(dt.service.messaging.publish.count, scalar: true, rate: 1m, default: 0),',
    );
    expect(formatted).toContain('},');
    expect(formatted).toContain('by: {');
    expect(formatted).toContain('  dt.entity.service,');
    expect(formatted).toContain('  dt.entity.process_group,');
    expect(formatted).toContain('},');
    expect(formatted).toContain('union: true');
    expect(formatted).toContain('| fieldsAdd entityName(dt.entity.service)');
    expect(formatted).toContain('| summarize {');
    expect(formatted).toContain('      receive.rate_per_minute = sum(receive.rate_per_minute),');
    expect(formatted).toContain('    },');
    expect(formatted).toContain('    by: {');
    expect(formatted).toContain('      dt.entity.service,');
    expect(formatted).toContain('    }');
    expect(formatted).toContain(`| fieldsAdd entity = record(entityId = dt.entity.service,
        displayName = entityName(dt.entity.service),
        lifetimeEndMillis = unixMillisFromTimestamp(lifetime[end]),
        customIconPath = customIconPath,
        icon = icon[primaryIconType])`);
  });

  test('newlines', () => {
    const formatted = formatDql(newlines);
    expect(formatted).toContain(`fetch spans, from: -30m, samplingRatio: 1000, scanLimitGBytes: 50

  // based on the applied filters

// only show outgoing calls for filtered traces

| fieldsAdd sampling.probability = (power(2, 56) - coalesce(sampling.threshold, 0)) * power(2, -56) // comment
// only show outgoing calls for filtered traces

| fieldsAdd sampling.multiplicity = 1/sampling.probability

| fieldsAdd multiplicity = coalesce(sampling.multiplicity, 1) * coalesce(aggregation.count, 1) * dt.system.sampling_ratio`);
  });

  test('handles escaped backticks correctly for top-level commands', () => {
    const input = `| filter matchesValue(\`url\`, "oteldemo.CurrencyService") fetch spans`;
    const expected = `| filter matchesValue(\`url\`, "oteldemo.CurrencyService") fetch spans`;
    expect(formatDql(input)).toBe(expected);
  });

  test('handles escaped backticks correctly for commands', () => {
    const input = `| filter matchesValue(\`url\`, "test") | nextCommand`;
    const expected = `| filter matchesValue(\`url\`, "test")\n| nextCommand`;
    expect(formatDql(input)).toBe(expected);
  });
});
