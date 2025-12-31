import { formatCommand } from '../../src/formatting/format-command';

describe('formatCommand', () => {
  it('should format command with arguments', () => {
    expect(formatCommand('fields a,b', 0)).toBe('fields\n  a,\n  b');
  });

  it('should indent subsequent commands', () => {
    expect(formatCommand('fields a,b', 1)).toBe('| fields\n  a,\n  b');
  });

  it('should not enforce newlines for arguments of root commands at index 0', () => {
    expect(formatCommand('fetch dt.entity.host, dt.entity.service', 0)).toBe('fetch dt.entity.host, dt.entity.service');
  });
});
