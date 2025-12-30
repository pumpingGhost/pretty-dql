import { formatCommand } from '../../src/formatting/format-command';

describe('formatCommand', () => {
    it('should format command with arguments', () => {
        expect(formatCommand('fields a,b', 0)).toBe('fields\na,\nb');
    });

    it('should indent subsequent commands', () => {
        expect(formatCommand('fields a,b', 1)).toBe('| fields\n  a,\n  b');
    });
});

