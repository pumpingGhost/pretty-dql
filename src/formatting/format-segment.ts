import { handleBracket } from './handle-bracket';
import { handleColon } from './handle-colon';

export const formatSegment = (seg: string): string => {
  // Skip formatting for quoted strings
  if (seg.startsWith('"') || seg.startsWith("'") || seg.startsWith('`') || seg.startsWith('$')) {
    return seg;
  }

  let newSeg = '';
  let i = 0;
  while (i < seg.length) {
    const char = seg[i];
    if ('[]{}'.includes(char)) {
      const result = handleBracket(char, seg, i);
      if (char === ']' || char === '}') {
        // Trim the end of the previous segment before appending the closing bracket
        newSeg = newSeg.trimEnd() + result.newSeg;
      } else {
        newSeg += result.newSeg;
      }
      i = result.newIndex;
    } else if (char === ':') {
      const result = handleColon(seg, i);
      newSeg += result.newSeg;
      i = result.newIndex;
    } else {
      newSeg += char;
      i++;
    }
  }
  return newSeg;
};
