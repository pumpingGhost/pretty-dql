import { formatSegment } from './formatSegment';

export const applyFormattingToCode = (text: string): string => {
  // Apply formatting to the whole text, handling quotes internally
  return formatSegment(text);
};
