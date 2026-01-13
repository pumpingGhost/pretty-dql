import { splitByDelimiter } from '../../src/formatting/splitByDelimiter';

describe('splitByDelimiter', () => {
  it('should split by delimiter', () => {
    expect(splitByDelimiter('a,b,c', ',')).toEqual(['a', 'b', 'c']);
  });

  it('should not split inside quotes', () => {
    expect(splitByDelimiter('a,"b,c",d', ',')).toEqual(['a', '"b,c"', 'd']);
  });

  it('should not split inside brackets', () => {
    expect(splitByDelimiter('a,[b,c],d', ',')).toEqual(['a', '[b,c]', 'd']);
  });

  it('should not split inside line comments', () => {
    expect(splitByDelimiter('a, // b,c \n d', ',')).toEqual(['a', '// b,c \n d']);
  });

  it('should handles line comments with delimiter correctly', () => {
    expect(splitByDelimiter('| fields a // | filter b', '|')).toEqual(['', 'fields a // | filter b']);
  });
});
