export const handleEquals = (seg: string, index: number): { newSeg: string; newIndex: number } => {
  let newSeg = '';
  let i = index;

  // Look behind (in seg)
  const prevChar = i > 0 ? seg[i - 1] : '';
  const isPartOfComposite = ['!', '<', '>'].includes(prevChar);

  // Check for forward composite (==, =~)
  let operator = '=';
  if (i + 1 < seg.length && ['=', '~'].includes(seg[i + 1])) {
    operator += seg[i + 1];
    i++;
  }

  if (isPartOfComposite) {
    newSeg += operator;
  } else {
    // We can return ` =`.
    // We also need to consume trailing spaces in `seg`. to ensure "exactly one space".
    newSeg += ' ' + operator;
  }

  // Now handle space AFTER.
  // Skip existing spaces in input
  i++;
  while (i < seg.length && /\s/.test(seg[i])) {
    i++;
  }
  // Add exactly one space after
  newSeg += ' ';

  return { newSeg, newIndex: i };
};
