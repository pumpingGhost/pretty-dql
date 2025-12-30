import { handleColon } from '../../src/formatting/handle-colon';

describe('handleColon', () => {
  it('should add space after colon', () => {
    expect(handleColon('a:b', 1)).toEqual({ newSeg: ': ', newIndex: 2 });
  });

  it('should not add space after colon if followed by slash', () => {
    expect(handleColon('http://', 4)).toEqual({ newSeg: ':', newIndex: 5 });
  });

  it('should skip existing space after colon', () => {
    expect(handleColon('a: b', 1)).toEqual({ newSeg: ': ', newIndex: 3 });
  });
});
