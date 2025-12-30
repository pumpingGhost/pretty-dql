export const handleBracket = (char: string, seg: string, index: number): { newSeg: string; newIndex: number } => {
    // Enforce spacing rules for brackets: one space inside
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

