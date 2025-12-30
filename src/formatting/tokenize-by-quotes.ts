import { isEscaped } from './is-escaped';

export const tokenizeByQuotes = (text: string): string[] => {
    // We want to split the text into segments, keeping quoted strings intact
    const segments: string[] = [];
    let current = '';
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoteChar) {
            current += char;
            // Check if the current quote is closed and not escaped
            if (char === quoteChar && !isEscaped(text, i)) {
                quoteChar = '';
                segments.push(current);
                current = '';
            }
            continue;
        }

        if (char === '"' || char === "'") {
            // We found a start of a quoted string, so we push the previous segment
            if (current) segments.push(current);
            quoteChar = char;
            current = char;
            continue;
        }

        current += char;
    }
    if (current) segments.push(current);
    return segments;
};

