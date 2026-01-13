import { formatDql } from '../../src/formatting/formatDql';

describe('trailingCommentIndent', () => {
  it('should not indent comments trailing the last argument', () => {
    const input = `| join [ fetch spans ]
, on: {trace.id}, kind: inner

// trailing comment
| fieldsAdd x`;

    // We expect the trailing comment to be flush left (or user indented), not argument indented.
    // arguments are indented by newline+indent.
    // kind: inner is indented.
    // trailing comment should be treated separately.
    const expected = `| join [
      fetch spans
    ],
    on: { trace.id },
    kind: inner

// trailing comment
| fieldsAdd x`;

    expect(formatDql(input)).toBe(expected);
  });
});
