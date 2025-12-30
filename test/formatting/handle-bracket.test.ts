import { handleBracket } from '../../src/formatting/handle-bracket';

describe('handleBracket', () => {
  it('should add space inside brackets', () => {
    expect(handleBracket('[', '[a]', 0)).toEqual({ newSeg: '[ ', newIndex: 1 });
    expect(handleBracket(']', '[a]', 2)).toEqual({ newSeg: ' ]', newIndex: 3 });
  });

  it('should skip existing space inside brackets', () => {
    expect(handleBracket('[', '[ a]', 0)).toEqual({ newSeg: '[ ', newIndex: 2 });
  });
});
