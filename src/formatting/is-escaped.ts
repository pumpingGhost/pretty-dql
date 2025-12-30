export const isEscaped = (str: string, index: number): boolean => {
  // Check if the character at the given index is escaped by counting preceding backslashes
  let backslashCount = 0;
  for (let j = index - 1; j >= 0; j--) {
    if (str[j] === '\\') backslashCount++;
    else break;
  }
  return backslashCount % 2 !== 0;
};
