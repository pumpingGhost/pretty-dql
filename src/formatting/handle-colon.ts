export const handleColon = (seg: string, index: number): { newSeg: string; newIndex: number } => {
    // Ensure that a colon is followed by a space, unless it's part of a URL (://)
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

