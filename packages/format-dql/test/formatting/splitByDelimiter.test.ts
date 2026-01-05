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
});
