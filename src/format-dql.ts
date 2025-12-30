const isEscaped = (str: string, index: number): boolean => {
    // We check if the character at the given index is escaped by counting preceding backslashes
    let backslashCount = 0;
    for (let j = index - 1; j >= 0; j--) {
        if (str[j] === '\\') backslashCount++;
        else break;
    }
    return backslashCount % 2 !== 0;
};

const tokenizeByQuotes = (text: string): string[] => {
    // We want to split the text into segments, keeping quoted strings intact
    const segments: string[] = [];
    let current = '';
    let quoteChar = '';

    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (quoteChar) {
            current += char;
            // We check if the current quote is closed and not escaped
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

const processChar = (
    char: string,
    str: string,
    index: number,
    state: { quoteChar: string; depth: number; current: string; parts: string[] },
    delimiter: string,
) => {
    // We handle characters inside quotes to avoid splitting on delimiters within strings
    if (state.quoteChar) {
        state.current += char;
        if (char === state.quoteChar && !isEscaped(str, index)) state.quoteChar = '';
        return;
    }

    if (char === '"' || char === "'") {
        state.quoteChar = char;
        state.current += char;
        return;
    }

    // We track the depth of nested structures like brackets to avoid splitting inside them
    if ('([{'.includes(char)) {
        state.depth++;
        state.current += char;
        return;
    }

    if (')]}'.includes(char)) {
        state.depth--;
        state.current += char;
        return;
    }

    // We split by the delimiter only if we are at the top level (depth 0)
    if (char === delimiter && state.depth === 0) {
        state.parts.push(state.current.trim());
        state.current = '';
        return;
    }

    state.current += char;
};

const splitByDelimiter = (str: string, delimiter: string): string[] => {
    // We initialize the state for splitting the string by a delimiter
    const state = { quoteChar: '', depth: 0, current: '', parts: [] as string[] };

    for (let i = 0; i < str.length; i++) {
        processChar(str[i], str, i, state, delimiter);
    }
    if (state.current.trim()) state.parts.push(state.current.trim());
    return state.parts;
};

const handleBracket = (char: string, seg: string, index: number): { newSeg: string; newIndex: number } => {
    // We enforce spacing rules for brackets: one space inside
    let newSeg = '';
    let i = index;
    if (char === '[') {
        newSeg += '[ ';
        i++;
        while (i < seg.length && /\s/.test(seg[i])) i++;
    } else if (char === ']') {
        newSeg = ' ]';
        i++;
    } else if (char === '{') {
        newSeg += '{ ';
        i++;
        while (i < seg.length && /\s/.test(seg[i])) i++;
    } else if (char === '}') {
        newSeg = ' }';
        i++;
    }
    return { newSeg, newIndex: i };
};

const handleColon = (seg: string, index: number): { newSeg: string; newIndex: number } => {
    // We ensure that a colon is followed by a space, unless it's part of a URL (://)
    let newSeg = '';
    let i = index;
    if (i + 1 < seg.length && seg[i + 1] === '/') {
        newSeg += ':';
        i++;
    } else {
        newSeg += ': ';
        i++;
        while (i < seg.length && /\s/.test(seg[i])) i++;
    }
    return { newSeg, newIndex: i };
};

const formatSegment = (seg: string): string => {
    // We skip formatting for quoted strings
    if (seg.startsWith('"') || seg.startsWith("'")) return seg;

    let newSeg = '';
    let i = 0;
    while (i < seg.length) {
        const char = seg[i];
        if ('[]{}'.includes(char)) {
            const result = handleBracket(char, seg, i);
            if (char === ']' || char === '}') {
                // We trim the end of the previous segment before appending the closing bracket
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

const applyFormattingToCode = (text: string): string => {
    // We tokenize the text by quotes and apply formatting to each segment
    return tokenizeByQuotes(text)
        .map((seg) => formatSegment(seg))
        .join('');
};

const formatCommand = (cmdStr: string, index: number): string => {
    const p = cmdStr.trim();
    if (p.length === 0) return '';

    const firstSpaceIndex = p.search(/\s/);
    const commandName = firstSpaceIndex === -1 ? p : p.slice(0, firstSpaceIndex);
    const argsStr = firstSpaceIndex === -1 ? '' : p.slice(firstSpaceIndex + 1);

    const prefix = index > 0 ? '| ' : '';

    // We check if the command name is valid (alphanumeric), otherwise we just format the whole string
    if (!/^\w+$/.test(commandName)) {
        return prefix + applyFormattingToCode(p);
    }

    // We split the arguments by comma
    const args = splitByDelimiter(argsStr, ',');
    const formattedArgs = args.map((arg) => applyFormattingToCode(arg).trim());

    if (formattedArgs.length > 1) {
        // We indent the arguments if there are multiple
        const indent = index > 0 ? '  ' : '';
        const joinedArgs = formattedArgs.join(',\n' + indent);
        return prefix + commandName + '\n' + indent + joinedArgs;
    } else {
        const joinedArgs = formattedArgs.join(', ');
        return prefix + commandName + (joinedArgs ? ' ' + joinedArgs : '');
    }
};

/**
 * Formats a DQL query string.
 *
 * @param dql - The DQL query string to format.
 * @returns The formatted DQL query string.
 */
export const formatDql = (dql: string): string => {
    // We split the DQL query by the pipe character to separate commands
    const commands = splitByDelimiter(dql, '|');
    return commands
        .map((cmd, index) => formatCommand(cmd, index))
        .filter((p) => p.length > 0)
        .join('\n');
};

const input = `| fields [entity], {queryCount    } = toLong(queryCount), errorCount = toLong(errorCount), | fieldsAdd x | summarize count(), by:{entity}`;

console.log(formatDql(input));
