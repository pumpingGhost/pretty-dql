import { tokenizeByQuotes } from './tokenize-by-quotes';
import { formatSegment } from './format-segment';

export const applyFormattingToCode = (text: string): string => {
  // Tokenize the text by quotes and apply formatting to each segment
  return tokenizeByQuotes(text)
    .map((seg) => formatSegment(seg))
    .join('');
};
